
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const NOTION_CLIENT_ID = Deno.env.get("NOTION_CLIENT_ID");
const NOTION_CLIENT_SECRET = Deno.env.get("NOTION_CLIENT_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const { code, redirect_uri } = await req.json();

  const tokenUrl = "https://api.notion.com/v1/oauth/token";
  const basicAuth = btoa(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`);

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri
    })
  });

  const tokenRes = await resp.json();

  // Save token to the authenticated user's session/database as needed (not shown)

  return new Response(JSON.stringify(tokenRes), {
    headers: { "Content-Type": "application/json" }
  });
});
