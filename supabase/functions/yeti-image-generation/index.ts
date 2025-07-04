import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  prompt: string;
  model: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  provider: 'a4f';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model, width = 1024, height = 1024, steps = 20, guidance_scale = 7.5, provider }: ImageRequest = await req.json();
    
    let response;
    
    switch (provider) {
      case 'a4f':
        response = await handleA4F(prompt, model, width, height, steps, guidance_scale);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yeti-image-generation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleA4F(prompt: string, model: string, width: number, height: number, steps: number, guidance_scale: number) {
  const apiKey = Deno.env.get('A4F_API_KEY');
  if (!apiKey) throw new Error('A4F API key not configured');

  const response = await fetch('https://api.a4f.co/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      width,
      height,
      steps,
      guidance_scale,
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`A4F API error: ${error}`);
  }

  const data = await response.json();
  return {
    images: data.data || [data],
    model,
    provider: 'a4f',
    prompt
  };
}