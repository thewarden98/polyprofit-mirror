import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOME_API_BASE = 'https://data-api.polymarket.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'v1/leaderboard';
    
    // Forward all other query params
    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        params.append(key, value);
      }
    });

    const apiUrl = `${DOME_API_BASE}/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log(`Fetching from DOME API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // DOME API may use API key in header or query param
        'Authorization': `Bearer ${Deno.env.get('DOME_API_KEY') || ''}`,
      },
    });

    if (!response.ok) {
      console.error(`DOME API error: ${response.status} ${response.statusText}`);
      // Try without auth header as fallback (some endpoints are public)
      const publicResponse = await fetch(apiUrl);
      if (!publicResponse.ok) {
        throw new Error(`DOME API error: ${publicResponse.status}`);
      }
      const data = await publicResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in polymarket-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
