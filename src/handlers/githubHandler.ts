import { ConnectionConfig } from "@/types/platform";

// Github OAuth2 config
const GITHUB_CLIENT_ID = "YOUR_SUPABASE_GITHUB_CLIENT_ID";
const REDIRECT_URI = `${window.location.origin}/oauth/callback/github`;

// Util: open OAuth popup (fallback to window.location if popup is blocked)
function startOAuthFlow() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=repo,user`;

  // Open in new window or redirect directly
  const w = window.open(githubAuthUrl, "_blank", "width=500,height=700");
  if (!w) window.location.href = githubAuthUrl;
}

// Handler: will be invoked AFTER Supabase edge function exchanges the token
export const githubHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    // Trigger OAuth2 login (handled in ConnectionDialog)
    startOAuthFlow();
    return new Promise(() => {}); // Never resolves, user action completes in another call
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing GitHub connection...");
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return true;
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from GitHub...");
    return true;
  }
};
