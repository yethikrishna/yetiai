import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

// Environment variables for Google OAuth credentials
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

// Define scopes for different Google services
const GOOGLE_SCOPES = {
  gmail: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "openid",
    "email",
    "profile"
  ],
  drive: [
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "email",
    "profile"
  ],
  sheets: [
    "https://www.googleapis.com/auth/spreadsheets",
    "openid",
    "email",
    "profile"
  ],
  docs: [
    "https://www.googleapis.com/auth/documents",
    "openid",
    "email",
    "profile"
  ]
};

serve(async (req) => {
  // CORS headers for development
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      headers, 
      status: 405 
    });
  }

  try {
    const requestData = await req.json();
    const { code, redirectUri, service, refresh_token } = requestData;

    // Handle token refresh if refresh token is provided
    if (refresh_token) {
      return await handleTokenRefresh(refresh_token, service, headers);
    }

    // Validate required parameters for new token requests
    if (!code || !redirectUri || !service) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }), 
        { headers, status: 400 }
      );
    }

    // Validate service type
    if (!GOOGLE_SCOPES[service]) {
      return new Response(
        JSON.stringify({ error: `Unsupported service: ${service}` }), 
        { headers, status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    // Check for OAuth errors
    if (tokenData.error) {
      console.error(`Google OAuth error: ${tokenData.error}`, tokenData.error_description);
      return new Response(
        JSON.stringify({ 
          error: tokenData.error, 
          description: tokenData.error_description 
        }), 
        { headers, status: 400 }
      );
    }

    // Return the tokens
    return new Response(JSON.stringify(tokenData), { headers });
  } catch (error) {
    console.error("Error in Google OAuth function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }), 
      { headers, status: 500 }
    );
  }
});

/**
 * Handle refreshing an expired access token
 */
async function handleTokenRefresh(refreshToken: string, service: string, headers: any) {
  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token"
      })
    });

    const tokenData = await response.json();

    // Check for OAuth errors
    if (tokenData.error) {
      console.error(`Google token refresh error: ${tokenData.error}`, tokenData.error_description);
      return new Response(
        JSON.stringify({ 
          error: tokenData.error, 
          description: tokenData.error_description 
        }), 
        { headers, status: 400 }
      );
    }

    // Add the refresh token back since Google doesn't return it again
    tokenData.refresh_token = refreshToken;
    
    return new Response(JSON.stringify(tokenData), { headers });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return new Response(
      JSON.stringify({ error: "Token refresh failed", message: error.message }), 
      { headers, status: 500 }
    );
  }
}
