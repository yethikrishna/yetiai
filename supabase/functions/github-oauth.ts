
// @ts-ignore
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const GITHUB_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const { code } = await req.json();

  // Exchange code for tokens
  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
    })
  });
  const tokenRes = await resp.json();
  // Save token to the authenticated user's session/database as needed (not shown)
  // Example: store using Supabase client as per your app logic.

  return new Response(JSON.stringify(tokenRes), {
    headers: { "Content-Type": "application/json" }
  });
});
