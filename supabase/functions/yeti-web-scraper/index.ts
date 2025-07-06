import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  url: string;
  prompt?: string;
  action?: 'scrape' | 'interact' | 'extract';
  elements?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, prompt = "Extract the main content from this page", action = 'scrape', elements }: ScrapingRequest = await req.json();
    
    const response = await handleAirtopScraping(url, prompt, action, elements);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yeti-web-scraper:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleAirtopScraping(url: string, prompt: string, action: string, elements?: string[]) {
  const apiKey = Deno.env.get('AIRTOP_API_KEY');
  if (!apiKey) throw new Error('Airtop API key not configured');

  // Create session
  const sessionResponse = await fetch('https://api.airtop.ai/v1/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      configuration: {
        timeoutMinutes: 10,
      },
    }),
  });

  if (!sessionResponse.ok) {
    const error = await sessionResponse.text();
    throw new Error(`Airtop session creation error: ${error}`);
  }

  const sessionData = await sessionResponse.json();
  const sessionId = sessionData.data.id;

  try {
    // Create window
    const windowResponse = await fetch(`https://api.airtop.ai/v1/sessions/${sessionId}/windows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!windowResponse.ok) {
      const error = await windowResponse.text();
      throw new Error(`Airtop window creation error: ${error}`);
    }

    const windowData = await windowResponse.json();
    const windowId = windowData.data.windowId;

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Query the page
    const queryResponse = await fetch(`https://api.airtop.ai/v1/sessions/${sessionId}/windows/${windowId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        configuration: {
          experimental: {
            includeVisualAnalysis: "auto",
          },
        },
      }),
    });

    if (!queryResponse.ok) {
      const error = await queryResponse.text();
      throw new Error(`Airtop query error: ${error}`);
    }

    const queryData = await queryResponse.json();

    return {
      url,
      content: queryData.data.modelResponse,
      action,
      success: true,
      provider: 'airtop'
    };

  } finally {
    // Terminate session
    await fetch(`https://api.airtop.ai/v1/sessions/${sessionId}/terminate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
}