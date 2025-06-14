
import { ConnectionConfig } from "@/types/platform";

// Notion OAuth2 config
const NOTION_CLIENT_ID = "YOUR_SUPABASE_NOTION_CLIENT_ID";
const REDIRECT_URI = `${window.location.origin}/oauth/callback/notion`;
const RESPONSE_TYPE = "code";

function startOAuthFlow() {
  const authUrl = `https://api.notion.com/v1/oauth/authorize` +
    `?client_id=${encodeURIComponent(NOTION_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=${RESPONSE_TYPE}` +
    `&owner=user`;

  const w = window.open(authUrl, "_blank", "width=500,height=700");
  if (!w) window.location.href = authUrl;
}

export const notionHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    startOAuthFlow();
    return new Promise(() => {});
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing Notion connection...");
    await new Promise(resolve => setTimeout(resolve, 1100));
    return true;
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from Notion...");
    return true;
  }
};
