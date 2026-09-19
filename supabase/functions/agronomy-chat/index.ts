// Supabase Edge Function: agronomy-chat
// Secure server-side agronomist conversational advisory
// GEMINI_API_KEY is retrieved securely from server environment variables and NEVER exposed to clients.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGE_LENGTH = 1000;

// In-memory sliding window rate limiter
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
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait 1 minute before sending further advisory requests.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization') || req.headers.get('apikey');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required to access AgroMind AI advisory.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY is not configured on the server.',
          source: 'server_configuration_error',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { text, context = {} } = body;

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text query is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.trim().length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} character limit.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are AgroMind AI, an elite digital agronomist from Krishi Vigyan Kendra (KVK) Gujarat.
Context about the farmer:
- Farmer Name: ${context.farmerName || 'Farmer'}
- Location: ${context.district || 'Gujarat'}, Gujarat
- Cultivated Plots: ${context.crops || 'Cotton, Groundnut'}
- Current Weather: ${context.weatherCondition || 'Normal'} (Spray window: ${context.spraySuitability || 'Favorable'})

Instructions:
1. Provide practical, accurate agricultural advice tailored to Gujarat agro-climatic conditions.
2. Recommend specific CIBRC-approved formulations (e.g. Chlorantraniliprole, Emamectin Benzoate, Mancozeb, Neem oil) with standard dosages per 10L or 15L spray pump.
3. Return ONLY a valid JSON object matching this schema:
{
  "textEn": "Concise, actionable response in English (2-3 sentences)",
  "textGu": "Accurate Gujarati translation of the response (2-3 sentences)",
  "suggestions": ["Follow-up question 1", "Follow-up question 2"]
}
Do not use markdown code block wrappers.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nFarmer Query: ${text}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ error: `AI provider error: ${geminiResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await geminiResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Empty response received from AI model.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(rawText);
    const now = new Date();

    const assistantMsg = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      textEn: parsed.textEn || text,
      textGu: parsed.textGu || parsed.textEn || text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: parsed.suggestions || ['Open Camera to scan leaf', 'Check Mandi rates'],
      timestamp: Date.now(),
      isAiEstimate: true,
      isOfflineFallback: false,
    };

    return new Response(JSON.stringify({ success: true, message: assistantMsg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error processing chat' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
