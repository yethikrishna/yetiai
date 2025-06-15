
import { ConnectionConfig } from "@/types/platform";

// Gmail OAuth2 config
const GMAIL_CLIENT_ID = "YOUR_SUPABASE_GMAIL_CLIENT_ID";
const REDIRECT_URI = `${window.location.origin}/oauth/callback/gmail`;
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify openid email profile";
const RESPONSE_TYPE = "code";
const ACCESS_TYPE = "offline";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
  };
}

interface GmailSearchResult {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

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

async function makeGmailApiRequest(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function decodeBase64(encodedData: string): string {
  try {
    // Gmail API returns base64url encoded data
    const base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
}

export const gmailHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    startOAuthFlow();
    return new Promise(() => {}); // Resolved after the OAuth2 callback
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing Gmail connection...");
    try {
      if (!config.credentials.accessToken) {
        return false;
      }

      // Test by fetching user profile
      await makeGmailApiRequest('profile', config.credentials.accessToken);
      console.log("Gmail connection test successful");
      return true;
    } catch (error) {
      console.error("Gmail connection test failed:", error);
      return false;
    }
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from Gmail...");
    // In a real implementation, you might want to revoke the token
    return true;
  },

  // MCP Functions for Gmail
  readEmails: async (config: ConnectionConfig, query: string = '', maxResults: number = 10): Promise<GmailMessage[]> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Reading Gmail emails with query: "${query}"`);
      
      // Search for messages
      const searchParams = new URLSearchParams({
        q: query,
        maxResults: maxResults.toString(),
      });

      const searchResult: GmailSearchResult = await makeGmailApiRequest(
        `messages?${searchParams}`,
        config.credentials.accessToken
      );

      if (!searchResult.messages) {
        console.log('No messages found');
        return [];
      }

      // Fetch full message details
      const messages = await Promise.all(
        searchResult.messages.slice(0, maxResults).map(async (msg) => {
          return await makeGmailApiRequest(
            `messages/${msg.id}`,
            config.credentials.accessToken
          );
        })
      );

      console.log(`Successfully read ${messages.length} emails`);
      return messages;
    } catch (error) {
      console.error('Error reading emails:', error);
      throw error;
    }
  },

  sendEmail: async (
    config: ConnectionConfig, 
    to: string, 
    subject: string, 
    body: string, 
    isHtml: boolean = false
  ): Promise<boolean> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Sending email to: ${to}`);

      // Create email message in RFC 2822 format
      const contentType = isHtml ? 'text/html' : 'text/plain';
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: ${contentType}; charset=utf-8`,
        '',
        body
      ].join('\n');

      // Encode message in base64url format
      const encodedMessage = btoa(message)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await makeGmailApiRequest('messages/send', config.credentials.accessToken, {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedMessage
        })
      });

      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  searchEmails: async (
    config: ConnectionConfig, 
    searchQuery: string, 
    maxResults: number = 50
  ): Promise<{ messages: GmailMessage[]; totalCount: number }> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Searching Gmail with query: "${searchQuery}"`);

      const searchParams = new URLSearchParams({
        q: searchQuery,
        maxResults: maxResults.toString(),
      });

      const searchResult: GmailSearchResult = await makeGmailApiRequest(
        `messages?${searchParams}`,
        config.credentials.accessToken
      );

      if (!searchResult.messages) {
        return { messages: [], totalCount: 0 };
      }

      // Fetch basic details for search results (not full messages for performance)
      const messages = await Promise.all(
        searchResult.messages.map(async (msg) => {
          return await makeGmailApiRequest(
            `messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            config.credentials.accessToken
          );
        })
      );

      console.log(`Found ${messages.length} emails matching search`);
      return {
        messages,
        totalCount: searchResult.resultSizeEstimate
      };
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  },

  // Additional utility functions
  getEmailContent: (message: GmailMessage): string => {
    if (message.payload.body?.data) {
      return decodeBase64(message.payload.body.data);
    }

    // Check for multipart messages
    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return decodeBase64(part.body.data);
        }
      }
      // Fallback to HTML content
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return decodeBase64(part.body.data);
        }
      }
    }

    return message.snippet || '';
  },

  getEmailHeaders: (message: GmailMessage): Record<string, string> => {
    const headers: Record<string, string> = {};
    message.payload.headers.forEach(header => {
      headers[header.name.toLowerCase()] = header.value;
    });
    return headers;
  }
};
