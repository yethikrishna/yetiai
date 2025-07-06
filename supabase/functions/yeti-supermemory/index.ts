import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      content, 
      query, 
      userId, 
      metadata = {},
      memoryType = 'conversation'
    } = await req.json();

    console.log(`🧠 Yeti Supermemory: ${action} request for user ${userId}`);

    const supermemoryApiKey = Deno.env.get('SUPERMEMORY_API_KEY');
    const supermemoryBaseUrl = Deno.env.get('SUPERMEMORY_MCP_BASE_URL') || 'https://api.supermemory.ai';

    if (!supermemoryApiKey) {
      throw new Error('Supermemory API key not configured');
    }

    switch (action) {
      case 'store_memory':
        return await storeMemory(content, userId, metadata, memoryType, supermemoryApiKey, supermemoryBaseUrl);
      
      case 'retrieve_memory':
        return await retrieveMemory(query, userId, supermemoryApiKey, supermemoryBaseUrl);
      
      case 'search_memory':
        return await searchMemory(query, userId, supermemoryApiKey, supermemoryBaseUrl);
      
      case 'get_context':
        return await getContextualMemory(query, userId, supermemoryApiKey, supermemoryBaseUrl);
      
      case 'delete_memory':
        return await deleteMemory(query, userId, supermemoryApiKey, supermemoryBaseUrl);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Yeti Supermemory error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function storeMemory(
  content: string, 
  userId: string, 
  metadata: any, 
  memoryType: string,
  apiKey: string,
  baseUrl: string
) {
  console.log(`💾 Storing memory for user ${userId}: ${content.substring(0, 100)}...`);

  const response = await fetch(`${baseUrl}/v1/memories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: content,
      userId: userId,
      metadata: {
        ...metadata,
        type: memoryType,
        timestamp: new Date().toISOString(),
        source: 'yeti-ai'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory Store API error: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Memory stored successfully');
  
  return new Response(JSON.stringify({
    success: true,
    memoryId: data.id,
    content: content
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function retrieveMemory(
  query: string, 
  userId: string, 
  apiKey: string,
  baseUrl: string
) {
  console.log(`🔍 Retrieving memory for user ${userId}: ${query}`);

  const response = await fetch(`${baseUrl}/v1/memories/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      userId: userId,
      limit: 10,
      includeContent: true
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory Retrieve API error: ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Retrieved ${data.memories?.length || 0} memories`);
  
  return new Response(JSON.stringify({
    success: true,
    memories: data.memories || [],
    query: query
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function searchMemory(
  query: string, 
  userId: string, 
  apiKey: string,
  baseUrl: string
) {
  console.log(`🔎 Searching memory for user ${userId}: ${query}`);

  const response = await fetch(`${baseUrl}/v1/memories/semantic-search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      userId: userId,
      limit: 5,
      threshold: 0.7,
      includeMetadata: true
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory Search API error: ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Found ${data.results?.length || 0} relevant memories`);
  
  return new Response(JSON.stringify({
    success: true,
    results: data.results || [],
    query: query,
    relevanceScores: data.scores || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getContextualMemory(
  query: string, 
  userId: string, 
  apiKey: string,
  baseUrl: string
) {
  console.log(`🧩 Getting contextual memory for user ${userId}: ${query}`);

  const response = await fetch(`${baseUrl}/v1/memories/context`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      userId: userId,
      contextWindow: 5,
      includeRelated: true
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory Context API error: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Retrieved contextual memory successfully');
  
  return new Response(JSON.stringify({
    success: true,
    context: data.context || '',
    relatedMemories: data.related || [],
    summary: data.summary || ''
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteMemory(
  memoryId: string, 
  userId: string, 
  apiKey: string,
  baseUrl: string
) {
  console.log(`🗑️ Deleting memory ${memoryId} for user ${userId}`);

  const response = await fetch(`${baseUrl}/v1/memories/${memoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supermemory Delete API error: ${error}`);
  }

  console.log('✅ Memory deleted successfully');
  
  return new Response(JSON.stringify({
    success: true,
    deletedMemoryId: memoryId
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}