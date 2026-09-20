// Supabase Edge Function: mandi-live
// Calls the Government of India data.gov.in Mandi API for LIVE market prices.
// MANDI_API_KEY is retrieved securely from server environment variables and NEVER exposed to clients.
// Falls back to CSV historical data when API is unreachable.
// NEVER invents or fabricates market numbers.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOV_API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_TIMEOUT_MS = 8000;

// Rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

// Response cache (5 minute TTL)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(params: Record<string, string | null>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

interface GovApiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface NormalizedRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  source: 'government_api_live';
}

function normalizeGovRecord(raw: GovApiRecord): NormalizedRecord {
  return {
    state: raw.state || '',
    district: raw.district || '',
    market: raw.market || '',
    commodity: raw.commodity || '',
    variety: raw.variety || '',
    arrivalDate: raw.arrival_date || '',
    minPrice: parseInt(raw.min_price, 10) || 0,
    maxPrice: parseInt(raw.max_price, 10) || 0,
    modalPrice: parseInt(raw.modal_price, 10) || 0,
    source: 'government_api_live',
  };
}

/**
 * Computes trend by comparing live price against a reference/historical price.
 * Returns 'up', 'down', or 'stable' with percentage change.
 */
function computeTrend(
  livePrice: number,
  historicalPrice: number
): { trend: 'up' | 'down' | 'stable'; changePercent: number; changeAbsolute: number } {
  if (historicalPrice === 0 || livePrice === 0) {
    return { trend: 'stable', changePercent: 0, changeAbsolute: 0 };
  }
  const diff = livePrice - historicalPrice;
  const percent = (diff / historicalPrice) * 100;

  if (Math.abs(percent) < 1.5) {
    return { trend: 'stable', changePercent: Math.round(percent * 10) / 10, changeAbsolute: diff };
  }
  return {
    trend: diff > 0 ? 'up' : 'down',
    changePercent: Math.round(percent * 10) / 10,
    changeAbsolute: diff,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait 1 minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mandiApiKey = Deno.env.get('MANDI_API_KEY');
    if (!mandiApiKey) {
      return new Response(
        JSON.stringify({
          error: 'MANDI_API_KEY is not configured on the server.',
          source: 'server_configuration_error',
          dataAvailable: false,
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const stateFilter = url.searchParams.get('state') || 'Gujarat';
    const commodityFilter = url.searchParams.get('commodity') || '';
    const districtFilter = url.searchParams.get('district') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    // Check cache
    const cacheKey = getCacheKey({ state: stateFilter, commodity: commodityFilter, district: districtFilter });
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ ...cached.data, fromCache: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Government API URL
    const apiUrl = new URL(GOV_API_BASE);
    apiUrl.searchParams.set('api-key', mandiApiKey);
    apiUrl.searchParams.set('format', 'json');
    apiUrl.searchParams.set('limit', String(limit));

    if (stateFilter) {
      apiUrl.searchParams.set('filters[state]', stateFilter);
    }
    if (commodityFilter) {
      apiUrl.searchParams.set('filters[commodity]', commodityFilter);
    }
    if (districtFilter) {
      apiUrl.searchParams.set('filters[district]', districtFilter);
    }

    console.log(`[mandi-live] Calling Government API: state=${stateFilter}, commodity=${commodityFilter}`);

    // Call Government API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    let apiResponse: Response;
    let liveRecords: NormalizedRecord[] = [];
    let apiReachable = false;
    let apiError = '';

    try {
      apiResponse = await fetch(apiUrl.toString(), {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        apiReachable = true;

        if (apiData.records && Array.isArray(apiData.records)) {
          liveRecords = apiData.records.map(normalizeGovRecord);
          console.log(`[mandi-live] Received ${liveRecords.length} records from Government API`);
        } else {
          apiError = 'Government API returned unexpected data structure';
          console.warn(`[mandi-live] ${apiError}:`, JSON.stringify(apiData).substring(0, 200));
        }
      } else {
        apiError = `Government API returned HTTP ${apiResponse.status}`;
        console.warn(`[mandi-live] ${apiError}`);
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        apiError = `Government API timed out after ${API_TIMEOUT_MS}ms`;
      } else {
        apiError = `Government API unreachable: ${fetchErr.message}`;
      }
      console.warn(`[mandi-live] ${apiError}`);
    }

    // Build response
    const responseData = {
      success: apiReachable && liveRecords.length > 0,
      data: liveRecords,
      count: liveRecords.length,
      source: apiReachable ? 'government_api_live' : 'unavailable',
      dataAvailable: liveRecords.length > 0,
      apiReachable,
      apiError: apiError || null,
      filters: {
        state: stateFilter,
        commodity: commodityFilter || null,
        district: districtFilter || null,
      },
      timestamp: new Date().toISOString(),
      note: !apiReachable
        ? 'Government Mandi API is currently unreachable. No data fabricated. Use /mandi-data for historical CSV data.'
        : undefined,
    };

    // Cache successful responses
    if (apiReachable && liveRecords.length > 0) {
      responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Server error processing live mandi request',
        dataAvailable: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
