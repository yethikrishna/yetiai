
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const { code, redirect_uri } = await req.json();

  const tokenUrl = "https://oauth2.googleapis.com/token";

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      redirect_uri,
      grant_type: "authorization_code"
    })
  });

  const tokenRes = await resp.json();

  // Save token to the authenticated user's session/database as needed (not shown)

  return new Response(JSON.stringify(tokenRes), {
    headers: { "Content-Type": "application/json" }
  });
});
