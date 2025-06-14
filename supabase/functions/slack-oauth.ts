
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const SLACK_CLIENT_ID = Deno.env.get("SLACK_CLIENT_ID");
const SLACK_CLIENT_SECRET = Deno.env.get("SLACK_CLIENT_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const { code, redirect_uri } = await req.json();

  const tokenUrl = "https://slack.com/api/oauth.v2.access";

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
    redirect_uri,
  });

  const resp = await fetch(`${tokenUrl}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  const tokenRes = await resp.json();

  // Save token to the authenticated user's session/database as needed (not shown)

  return new Response(JSON.stringify(tokenRes), {
    headers: { "Content-Type": "application/json" }
  });
});
