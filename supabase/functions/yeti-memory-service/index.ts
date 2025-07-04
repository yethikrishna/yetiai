import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemoryRequest {
  action: 'search' | 'store' | 'retrieve' | 'list';
  query?: string;
  content?: string;
  title?: string;
  type?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, content, title, type, limit = 10 }: MemoryRequest = await req.json();
    
    let response;
    
    switch (action) {
      case 'search':
        response = await handleMemorySearch(query!, limit);
        break;
      case 'store':
        response = await handleMemoryStore(content!, title, type);
        break;
      case 'retrieve':
        response = await handleMemoryRetrieve(query!);
        break;
      case 'list':
        response = await handleMemoryList(limit);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yeti-memory-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleMemorySearch(query: string, limit: number) {
  const apiKey = Deno.env.get('SUPERMEMORY_API_KEY');
  const baseUrl = Deno.env.get('SUPERMEMORY_MCP_BASE_URL');
  
  if (!apiKey || !baseUrl) throw new Error('Supermemory configuration not found');

  const response = await fetch(`${baseUrl}/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit,
      filters: {},
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory search error: ${error}`);
  }

  const data = await response.json();
  return {
    results: data.results || [],
    query,
    provider: 'supermemory'
  };
}

async function handleMemoryStore(content: string, title?: string, type?: string) {
  const apiKey = Deno.env.get('SUPERMEMORY_API_KEY');
  const baseUrl = Deno.env.get('SUPERMEMORY_MCP_BASE_URL');
  
  if (!apiKey || !baseUrl) throw new Error('Supermemory configuration not found');

  const response = await fetch(`${baseUrl}/store`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      title: title || 'Yeti AI Memory',
      type: type || 'note',
      metadata: {
        source: 'yeti-ai',
        timestamp: new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory store error: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    success: true,
    provider: 'supermemory'
  };
}

async function handleMemoryRetrieve(id: string) {
  const apiKey = Deno.env.get('SUPERMEMORY_API_KEY');
  const baseUrl = Deno.env.get('SUPERMEMORY_MCP_BASE_URL');
  
  if (!apiKey || !baseUrl) throw new Error('Supermemory configuration not found');

  const response = await fetch(`${baseUrl}/retrieve/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory retrieve error: ${error}`);
  }

  const data = await response.json();
  return {
    memory: data,
    provider: 'supermemory'
  };
}

async function handleMemoryList(limit: number) {
  const apiKey = Deno.env.get('SUPERMEMORY_API_KEY');
  const baseUrl = Deno.env.get('SUPERMEMORY_MCP_BASE_URL');
  
  if (!apiKey || !baseUrl) throw new Error('Supermemory configuration not found');

  const response = await fetch(`${baseUrl}/list?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory list error: ${error}`);
  }

  const data = await response.json();
  return {
    memories: data.memories || [],
    provider: 'supermemory'
  };
}