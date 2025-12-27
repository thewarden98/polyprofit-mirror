import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Polymarket APIs
const DATA_API_BASE = 'https://data-api.polymarket.com';
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    let payload: any = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        payload = await req.json();
      } catch {
        payload = null;
      }
    }

    const endpoint = payload?.endpoint ?? url.searchParams.get('endpoint') ?? 'leaderboard';

    let apiUrl: string;

    // Route to correct endpoint
    if (endpoint === 'leaderboard') {
      // Get top traders leaderboard
      const limit = String(payload?.limit ?? url.searchParams.get('limit') ?? '100');
      apiUrl = `${DATA_API_BASE}/v1/leaderboard?limit=${limit}`;
    } else if (endpoint === 'search') {
      // Search profiles via Gamma API
      const query = (payload?.query ?? url.searchParams.get('query') ?? url.searchParams.get('q')) as string | null;
      if (!query) {
        throw new Error('Query parameter required for search endpoint');
      }
      apiUrl = `${GAMMA_API_BASE}/public-search?q=${encodeURIComponent(query)}&search_profiles=true&limit_per_type=50&optimized=true`;
    } else if (endpoint === 'markets') {
      // Search markets/events via Gamma API
      const query = (payload?.query ?? url.searchParams.get('query') ?? url.searchParams.get('q')) as string | null;
      if (!query) {
        throw new Error('Query parameter required for markets endpoint');
      }
      apiUrl = `${GAMMA_API_BASE}/public-search?q=${encodeURIComponent(query)}&limit_per_type=30&optimized=true`;
    } else if (endpoint === 'trending') {
      // Get trending/popular markets
      apiUrl = `${GAMMA_API_BASE}/events?active=true&closed=false&limit=20&order=volume&ascending=false`;
    } else if (endpoint === 'event') {
      // Get full event payload by slug (needed for clobTokenIds / order book)
      const slug = (payload?.slug ?? url.searchParams.get('slug')) as string | null;
      if (!slug) {
        throw new Error('slug parameter required for event endpoint');
      }
      apiUrl = `${GAMMA_API_BASE}/events/slug/${encodeURIComponent(slug)}`;
    } else if (endpoint === 'orderbook') {
      // Get order book for a specific market token
      const tokenId = (payload?.tokenId ?? url.searchParams.get('tokenId')) as string | null;
      if (!tokenId) {
        throw new Error('tokenId parameter required for orderbook endpoint');
      }
      apiUrl = `${CLOB_API_BASE}/book?token_id=${encodeURIComponent(tokenId)}`;
    } else if (endpoint === 'positions') {
      // Get positions for a specific user
      const user = (payload?.user ?? url.searchParams.get('user')) as string | null;
      if (!user) {
        throw new Error('User parameter required for positions endpoint');
      }
      apiUrl = `${DATA_API_BASE}/positions?user=${user}`;
    } else if (endpoint === 'profile') {
      // Get profile info for a user
      const user = (payload?.user ?? url.searchParams.get('user')) as string | null;
      if (!user) {
        throw new Error('User parameter required for profile endpoint');
      }
      apiUrl = `${DATA_API_BASE}/profile?user=${user}`;
    } else if (endpoint === 'activity') {
      // Get activity for a user
      const user = (payload?.user ?? url.searchParams.get('user')) as string | null;
      if (!user) {
        throw new Error('User parameter required for activity endpoint');
      }
      apiUrl = `${DATA_API_BASE}/activity?user=${user}&limit=50`;
    } else {
      // Generic endpoint passthrough (Data API)
      const params = new URLSearchParams();
      url.searchParams.forEach((value, key) => {
        if (key !== 'endpoint') {
          params.append(key, value);
        }
      });
      apiUrl = `${DATA_API_BASE}/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
    }
    console.log(`Fetching from Polymarket API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`Error body: ${errorBody}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // For search, return ONLY the matching profiles array
    // For markets, return the events array
    let responseData = data;
    if (endpoint === 'search') {
      responseData = data?.profiles ?? [];
    } else if (endpoint === 'markets') {
      responseData = data?.events ?? [];
    } else if (endpoint === 'trending') {
      responseData = Array.isArray(data) ? data : (data?.events ?? []);
    }
    
    // Log sample data for debugging
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log(`Successfully fetched ${responseData.length} items`);
      console.log(`Sample item keys: ${Object.keys(responseData[0]).join(', ')}`);
    } else if (endpoint === 'orderbook') {
      console.log(`Orderbook response keys: ${Object.keys(responseData).join(', ')}`);
    } else {
      console.log(`Response data: ${JSON.stringify(responseData).slice(0, 500)}`);
    }
    
    return new Response(JSON.stringify(responseData), {
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