import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Polymarket Data API base URL (no /v1 prefix - endpoints vary)
const API_BASE = 'https://data-api.polymarket.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'leaderboard';
    
    let apiUrl: string;
    
    // Route to correct endpoint
    if (endpoint === 'leaderboard') {
      // Get top traders leaderboard
      const limit = url.searchParams.get('limit') || '100';
      apiUrl = `${API_BASE}/v1/leaderboard?limit=${limit}`;
    } else if (endpoint === 'search') {
      // Search for users by username or wallet
      const query = url.searchParams.get('query');
      if (!query) {
        throw new Error('Query parameter required for search endpoint');
      }
      // Use the profiles endpoint to search
      apiUrl = `${API_BASE}/profiles?search=${encodeURIComponent(query)}&limit=50`;
    } else if (endpoint === 'positions') {
      // Get positions for a specific user
      const user = url.searchParams.get('user');
      if (!user) {
        throw new Error('User parameter required for positions endpoint');
      }
      apiUrl = `${API_BASE}/positions?user=${user}`;
    } else if (endpoint === 'profile') {
      // Get profile info for a user
      const user = url.searchParams.get('user');
      if (!user) {
        throw new Error('User parameter required for profile endpoint');
      }
      apiUrl = `${API_BASE}/profile?user=${user}`;
    } else if (endpoint === 'activity') {
      // Get activity for a user
      const user = url.searchParams.get('user');
      if (!user) {
        throw new Error('User parameter required for activity endpoint');
      }
      apiUrl = `${API_BASE}/activity?user=${user}&limit=50`;
    } else {
      // Generic endpoint passthrough
      const params = new URLSearchParams();
      url.searchParams.forEach((value, key) => {
        if (key !== 'endpoint') {
          params.append(key, value);
        }
      });
      apiUrl = `${API_BASE}/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
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
    
    // Log sample data for debugging
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched ${data.length} items`);
      console.log(`Sample item keys: ${Object.keys(data[0]).join(', ')}`);
      console.log(`Sample item: ${JSON.stringify(data[0])}`);
    } else {
      console.log(`Response data: ${JSON.stringify(data).slice(0, 500)}`);
    }
    
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
