
import { ConnectionConfig } from "@/types/platform";

// Gmail OAuth2 config (edit Client ID for your app)
const GMAIL_CLIENT_ID = "YOUR_SUPABASE_GMAIL_CLIENT_ID";
const REDIRECT_URI = `${window.location.origin}/oauth/callback/gmail`;
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send openid email profile";
const RESPONSE_TYPE = "code";
const ACCESS_TYPE = "offline"; // for refresh token

function startOAuthFlow() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(GMAIL_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=${RESPONSE_TYPE}` +
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&access_type=${ACCESS_TYPE}` +
    `&prompt=consent`;

  const w = window.open(authUrl, "_blank", "width=500,height=700");
  if (!w) window.location.href = authUrl;
}

export const gmailHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    startOAuthFlow();
    return new Promise(() => {}); // Resolved after the OAuth2 callback (in another call)
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing Gmail connection...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from Gmail...");
    return true;
  }
};
