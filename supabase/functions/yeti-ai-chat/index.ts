import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  provider: string;
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, messages, stream = false, max_tokens = 2000, temperature = 0.7 }: ChatRequest = await req.json();
    
    console.log(`🧊 Yeti Chat: Processing request with ${provider}/${model}`);
    
    let response;
    let fallbackProviders = [];
    
    // Define fallback order based on primary provider
    switch (provider) {
      case 'openai':
        fallbackProviders = [
          () => handleOpenAI(model, messages, max_tokens, temperature),
          () => handleOpenRouter('anthropic/claude-3.5-sonnet', messages, max_tokens, temperature),
          () => handleGemini('gemini-1.5-flash', messages, max_tokens, temperature),
          () => handleNovita('meta-llama/llama-3.1-8b-instruct', messages, max_tokens, temperature)
        ];
        break;
      case 'openrouter':
        fallbackProviders = [
          () => handleOpenRouter(model, messages, max_tokens, temperature),
          () => handleOpenAI('gpt-4o', messages, max_tokens, temperature),
          () => handleGemini('gemini-1.5-flash', messages, max_tokens, temperature),
          () => handleNovita('meta-llama/llama-3.1-8b-instruct', messages, max_tokens, temperature)
        ];
        break;
      case 'gemini':
        fallbackProviders = [
          () => handleGemini(model, messages, max_tokens, temperature),
          () => handleOpenAI('gpt-4o', messages, max_tokens, temperature),
          () => handleOpenRouter('anthropic/claude-3.5-sonnet', messages, max_tokens, temperature),
          () => handleNovita('meta-llama/llama-3.1-8b-instruct', messages, max_tokens, temperature)
        ];
        break;
      case 'novita':
        fallbackProviders = [
          () => handleNovita(model, messages, max_tokens, temperature),
          () => handleOpenAI('gpt-4o', messages, max_tokens, temperature),
          () => handleOpenRouter('anthropic/claude-3.5-sonnet', messages, max_tokens, temperature),
          () => handleGemini('gemini-1.5-flash', messages, max_tokens, temperature)
        ];
        break;
      default:
        // Default fallback order
        fallbackProviders = [
          () => handleOpenAI('gpt-4o', messages, max_tokens, temperature),
          () => handleOpenRouter('anthropic/claude-3.5-sonnet', messages, max_tokens, temperature),
          () => handleGemini('gemini-1.5-flash', messages, max_tokens, temperature),
          () => handleNovita('meta-llama/llama-3.1-8b-instruct', messages, max_tokens, temperature)
        ];
    }

    // Try each provider in the fallback order
    for (let i = 0; i < fallbackProviders.length; i++) {
      try {
        console.log(`🧊 Yeti Chat: Trying provider ${i + 1}/${fallbackProviders.length}`);
        response = await fallbackProviders[i]();
        console.log(`✅ Yeti Chat: Success with provider ${i + 1}`);
        break;
      } catch (error) {
        console.log(`❌ Yeti Chat: Provider ${i + 1} failed:`, error.message);
        if (i === fallbackProviders.length - 1) {
          throw new Error(`All providers failed. Last error: ${error.message}`);
        }
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❄️ Yeti Chat: All providers failed:', error);
    return new Response(JSON.stringify({ 
      error: 'All AI providers are currently unavailable. Please try again later.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleOpenRouter(model: string, messages: ChatMessage[], max_tokens: number, temperature: number) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) throw new Error('OpenRouter API key not configured');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://yeti-ai.com',
      'X-Title': 'Yeti AI Platform',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
    provider: 'openrouter'
  };
}

async function handleGemini(model: string, messages: ChatMessage[], max_tokens: number, temperature: number) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API key not configured');

  // Convert messages to Gemini format
  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const systemPrompt = messages.find(msg => msg.role === 'system')?.content;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata,
    model,
    provider: 'gemini'
  };
}

async function handleOpenAI(model: string, messages: ChatMessage[], max_tokens: number, temperature: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
    provider: 'openai'
  };
}

async function handleNovita(model: string, messages: ChatMessage[], max_tokens: number, temperature: number) {
  const apiKey = Deno.env.get('NOVITA_API_KEY');
  if (!apiKey) throw new Error('Novita API key not configured');

  const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Novita API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
    provider: 'novita'
  };
}