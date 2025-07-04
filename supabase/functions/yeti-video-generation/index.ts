import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoRequest {
  prompt?: string;
  image_url?: string;
  model: string;
  duration?: number;
  fps?: number;
  provider: 'a4f';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image_url, model, duration = 5, fps = 24, provider }: VideoRequest = await req.json();
    
    let response;
    
    switch (provider) {
      case 'a4f':
        response = await handleA4F(prompt, image_url, model, duration, fps);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yeti-video-generation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleA4F(prompt: string | undefined, image_url: string | undefined, model: string, duration: number, fps: number) {
  const apiKey = Deno.env.get('A4F_API_KEY');
  if (!apiKey) throw new Error('A4F API key not configured');

  const requestBody: any = {
    model,
    duration,
    fps,
  };

  if (prompt) {
    requestBody.prompt = prompt;
  }

  if (image_url) {
    requestBody.image_url = image_url;
  }

  const response = await fetch('https://api.a4f.co/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`A4F API error: ${error}`);
  }

  const data = await response.json();
  return {
    videos: data.data || [data],
    model,
    provider: 'a4f',
    prompt,
    image_url
  };
}