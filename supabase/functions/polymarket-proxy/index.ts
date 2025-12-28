import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to your application domains
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://id-preview--77f9af24-94a2-4e68-b437-264eb6f5f1e5.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Allowed endpoints - strict allowlist
const ALLOWED_ENDPOINTS = [
  'leaderboard', 'search', 'markets', 'trending',
  'event', 'orderbook', 'positions', 'profile', 'activity'
];

// Polymarket APIs
const DATA_API_BASE = 'https://data-api.polymarket.com';
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

// Helper to validate Ethereum wallet address format
function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper to validate limit parameter
function isValidLimit(limit: unknown, max: number = 100): number | null {
  const parsed = typeof limit === 'number' ? limit : parseInt(String(limit), 10);
  if (isNaN(parsed) || parsed < 1 || parsed > max) {
    return null;
  }
  return parsed;
}

// Helper to validate search query
function isValidSearchQuery(query: string): boolean {
  return query.length >= 1 && query.length <= 200;
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovable.dev')
  );
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Reject requests from non-allowed origins
  if (!isAllowedOrigin) {
    console.warn(`Rejected request from origin: ${origin}`);
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Authentication check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify the user is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.warn('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated request from user: ${user.id}`);

    const url = new URL(req.url);

    let payload: Record<string, unknown> | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        payload = await req.json();
      } catch {
        payload = null;
      }
    }

    const endpoint = String(payload?.endpoint ?? url.searchParams.get('endpoint') ?? 'leaderboard');

    // Validate endpoint against allowlist
    if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let apiUrl: string;

    // Route to correct endpoint with input validation
    if (endpoint === 'leaderboard') {
      const limitRaw = payload?.limit ?? url.searchParams.get('limit') ?? '100';
      const limit = isValidLimit(limitRaw, 100);
      if (limit === null) {
        return new Response(JSON.stringify({ error: 'Invalid limit parameter (1-100)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${DATA_API_BASE}/v1/leaderboard?limit=${limit}`;
    } else if (endpoint === 'search') {
      const query = String(payload?.query ?? url.searchParams.get('query') ?? url.searchParams.get('q') ?? '');
      if (!query || !isValidSearchQuery(query)) {
        return new Response(JSON.stringify({ error: 'Invalid query parameter (1-200 characters)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${GAMMA_API_BASE}/public-search?q=${encodeURIComponent(query)}&search_profiles=true&limit_per_type=50&optimized=true`;
    } else if (endpoint === 'markets') {
      const query = String(payload?.query ?? url.searchParams.get('query') ?? url.searchParams.get('q') ?? '');
      if (!query || !isValidSearchQuery(query)) {
        return new Response(JSON.stringify({ error: 'Invalid query parameter (1-200 characters)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${GAMMA_API_BASE}/public-search?q=${encodeURIComponent(query)}&limit_per_type=30&optimized=true`;
    } else if (endpoint === 'trending') {
      apiUrl = `${GAMMA_API_BASE}/events?active=true&closed=false&limit=20&order=volume&ascending=false`;
    } else if (endpoint === 'event') {
      const id = payload?.id ?? url.searchParams.get('id');
      const slug = payload?.slug ?? url.searchParams.get('slug');

      if (id) {
        // Validate id is alphanumeric/dashes only
        const idStr = String(id);
        if (!/^[a-zA-Z0-9\-_]+$/.test(idStr)) {
          return new Response(JSON.stringify({ error: 'Invalid event id format' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        apiUrl = `${GAMMA_API_BASE}/events/${encodeURIComponent(idStr)}`;
      } else if (slug) {
        const slugStr = String(slug);
        if (!/^[a-zA-Z0-9\-_]+$/.test(slugStr)) {
          return new Response(JSON.stringify({ error: 'Invalid event slug format' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        apiUrl = `${GAMMA_API_BASE}/events/slug/${encodeURIComponent(slugStr)}`;
      } else {
        return new Response(JSON.stringify({ error: 'id or slug parameter required for event endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (endpoint === 'orderbook') {
      const tokenId = String(payload?.tokenId ?? url.searchParams.get('tokenId') ?? '');
      if (!tokenId) {
        return new Response(JSON.stringify({ error: 'tokenId parameter required for orderbook endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Token IDs are typically long numeric strings
      if (!/^[0-9]+$/.test(tokenId)) {
        return new Response(JSON.stringify({ error: 'Invalid tokenId format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${CLOB_API_BASE}/book?token_id=${encodeURIComponent(tokenId)}`;
    } else if (endpoint === 'positions') {
      const user = String(payload?.user ?? url.searchParams.get('user') ?? '');
      if (!user || !isValidWalletAddress(user)) {
        return new Response(JSON.stringify({ error: 'Valid wallet address required for positions endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${DATA_API_BASE}/positions?user=${encodeURIComponent(user)}`;
    } else if (endpoint === 'profile') {
      const user = String(payload?.user ?? url.searchParams.get('user') ?? '');
      if (!user || !isValidWalletAddress(user)) {
        return new Response(JSON.stringify({ error: 'Valid wallet address required for profile endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${DATA_API_BASE}/profile?user=${encodeURIComponent(user)}`;
    } else if (endpoint === 'activity') {
      const user = String(payload?.user ?? url.searchParams.get('user') ?? '');
      if (!user || !isValidWalletAddress(user)) {
        return new Response(JSON.stringify({ error: 'Valid wallet address required for activity endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${DATA_API_BASE}/activity?user=${encodeURIComponent(user)}&limit=50`;
    } else {
      // This should never be reached due to the allowlist check above
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Transform response based on endpoint
    let responseData = data;
    if (endpoint === 'search') {
      responseData = data?.profiles ?? [];
    } else if (endpoint === 'markets') {
      responseData = data?.events ?? [];
    } else if (endpoint === 'trending') {
      responseData = Array.isArray(data) ? data : (data?.events ?? []);
    }
    
    // Log sample data for debugging (sanitized)
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log(`Successfully fetched ${responseData.length} items for endpoint: ${endpoint}`);
    } else if (endpoint === 'orderbook') {
      console.log(`Orderbook response received`);
    } else {
      console.log(`Response received for endpoint: ${endpoint}`);
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
