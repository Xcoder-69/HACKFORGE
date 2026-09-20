// Supabase Edge Function: mandi-data
// Serves preprocessed Mandi CSV data with filtering capabilities.
// Provides historical/reference market price data for all India + Gujarat focus.
// NO API keys exposed to client. Data sourced from Government CSV.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory sliding window rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
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

// --- Embedded Mandi Data ---
// In production, this would be loaded from a file or database.
// For Edge Functions, we embed the preprocessed JSON data.
// The data is loaded once when the function cold-starts.

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

interface MandiDataset {
  metadata: {
    generatedAt: string;
    totalRecords: number;
    uniqueStates: number;
    uniqueCommodities: number;
    uniqueDistricts: number;
    uniqueMarkets: number;
    gujaratRecords: number;
  };
  indexes: {
    states: string[];
    commodities: string[];
    districts: string[];
    markets: string[];
    gujaratCommodities: string[];
    gujaratMarkets: string[];
  };
  records: MandiRecord[];
}

// Data will be loaded on first request and cached
let cachedData: MandiDataset | null = null;
let dataLoadError: string | null = null;

async function loadData(): Promise<MandiDataset> {
  if (cachedData) return cachedData;

  try {
    // In Edge Functions, we read from a co-deployed file
    // For now, generate sample structure from CSV parsing logic
    const dataUrl = new URL('./mandi_data.json', import.meta.url);
    const response = await fetch(dataUrl);
    if (response.ok) {
      cachedData = await response.json();
      return cachedData!;
    }
  } catch (_e) {
    // File not found in edge function bundle — use inline fallback
  }

  // Fallback: Return empty dataset with error
  dataLoadError = 'Mandi data file not available in edge function bundle. Deploy with data file.';
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecords: 0,
      uniqueStates: 0,
      uniqueCommodities: 0,
      uniqueDistricts: 0,
      uniqueMarkets: 0,
      gujaratRecords: 0,
    },
    indexes: {
      states: [],
      commodities: [],
      districts: [],
      markets: [],
      gujaratCommodities: [],
      gujaratMarkets: [],
    },
    records: [],
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
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before retrying.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/mandi-data\/?/, '').replace(/^\/+/, '');

    const dataset = await loadData();

    // Route: GET /mandi-data/metadata — Return dataset metadata
    if (pathname === 'metadata' || pathname === 'meta') {
      return new Response(
        JSON.stringify({
          success: true,
          metadata: dataset.metadata,
          indexes: dataset.indexes,
          dataLoadError,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /mandi-data/commodities — List all unique commodities
    if (pathname === 'commodities') {
      const stateFilter = url.searchParams.get('state')?.toLowerCase();
      let commodities = dataset.indexes.commodities;

      if (stateFilter) {
        commodities = [
          ...new Set(
            dataset.records
              .filter((r) => r.state.toLowerCase() === stateFilter)
              .map((r) => r.commodity)
          ),
        ].sort();
      }

      return new Response(
        JSON.stringify({ success: true, commodities, count: commodities.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /mandi-data/markets — List all unique markets
    if (pathname === 'markets') {
      const stateFilter = url.searchParams.get('state')?.toLowerCase();
      let markets = dataset.indexes.markets;

      if (stateFilter) {
        markets = [
          ...new Set(
            dataset.records
              .filter((r) => r.state.toLowerCase() === stateFilter)
              .map((r) => r.market)
          ),
        ].sort();
      }

      return new Response(
        JSON.stringify({ success: true, markets, count: markets.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /mandi-data/states — List all states
    if (pathname === 'states') {
      return new Response(
        JSON.stringify({ success: true, states: dataset.indexes.states, count: dataset.indexes.states.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /mandi-data — Query records with filters
    const stateFilter = url.searchParams.get('state')?.toLowerCase();
    const districtFilter = url.searchParams.get('district')?.toLowerCase();
    const commodityFilter = url.searchParams.get('commodity')?.toLowerCase();
    const marketFilter = url.searchParams.get('market')?.toLowerCase();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let filtered = dataset.records;

    if (stateFilter) {
      filtered = filtered.filter((r) => r.state.toLowerCase().includes(stateFilter));
    }
    if (districtFilter) {
      filtered = filtered.filter((r) => r.district.toLowerCase().includes(districtFilter));
    }
    if (commodityFilter) {
      filtered = filtered.filter((r) => r.commodity.toLowerCase().includes(commodityFilter));
    }
    if (marketFilter) {
      filtered = filtered.filter((r) => r.market.toLowerCase().includes(marketFilter));
    }

    const totalMatches = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        success: true,
        data: paged,
        count: paged.length,
        totalMatches,
        offset,
        limit,
        source: 'csv_historical',
        dataAvailable: totalMatches > 0,
        filters: {
          state: stateFilter || null,
          district: districtFilter || null,
          commodity: commodityFilter || null,
          market: marketFilter || null,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error processing mandi data request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
