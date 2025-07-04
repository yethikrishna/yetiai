import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri, appId } = await req.json();

    // Validate required parameters
    if (!code || !redirectUri || !appId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Facebook App Secret from Supabase secrets
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    if (!appSecret) {
      console.error('Facebook App Secret not configured');
      return new Response(
        JSON.stringify({ error: 'OAuth configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code
    });

    const response = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook token exchange failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Token exchange failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens = await response.json();

    return new Response(JSON.stringify(tokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});