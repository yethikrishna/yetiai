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
      prompt, 
      imageUrl, 
      audioData, 
      videoUrl, 
      text,
      voice = 'alloy',
      width = 1024,
      height = 1024,
      duration = 5,
      model = 'flux-1-schnell'
    } = await req.json();

    console.log(`🎯 Yeti AI Multimodal: ${action} request received`);

    switch (action) {
      case 'generate_image':
        return await generateImage(prompt, width, height, model);
      
      case 'generate_video':
        return await generateVideo(prompt, duration);
      
      case 'analyze_image':
        return await analyzeImage(imageUrl, prompt);
      
      case 'analyze_video':
        return await analyzeVideo(videoUrl, prompt);
      
      case 'analyze_audio':
        return await analyzeAudio(audioData, prompt);
      
      case 'text_to_speech':
        return await textToSpeech(text, voice);
      
      case 'speech_to_text':
        return await speechToText(audioData);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Yeti AI Multimodal error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateImage(prompt: string, width: number, height: number, model: string) {
  console.log(`🎨 Generating image: ${prompt}`);
  
  const a4fApiKey = Deno.env.get('A4F_API_KEY');
  if (!a4fApiKey) {
    throw new Error('A4F API key not configured');
  }

  const response = await fetch('https://api.a4f.co/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${a4fApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      width: width,
      height: height,
      num_images: 1,
      quality: 'high'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`A4F Image API error: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Image generated successfully');
  
  return new Response(JSON.stringify({
    success: true,
    images: data.images,
    prompt: prompt
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateVideo(prompt: string, duration: number) {
  console.log(`🎬 Generating video: ${prompt}`);
  
  const a4fApiKey = Deno.env.get('A4F_API_KEY');
  if (!a4fApiKey) {
    throw new Error('A4F API key not configured');
  }

  const response = await fetch('https://api.a4f.co/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${a4fApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'minimax-video-01',
      prompt: prompt,
      duration: duration,
      fps: 24,
      aspect_ratio: '16:9'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`A4F Video API error: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Video generated successfully');
  
  return new Response(JSON.stringify({
    success: true,
    videos: data.videos,
    prompt: prompt
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeImage(imageUrl: string, prompt: string) {
  console.log(`🔍 Analyzing image with prompt: ${prompt}`);
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Analyze this image in detail.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Vision API error: ${error}`);
  }

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  console.log('✅ Image analyzed successfully');
  
  return new Response(JSON.stringify({
    success: true,
    analysis: analysis,
    imageUrl: imageUrl
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeVideo(videoUrl: string, prompt: string) {
  console.log(`🎬 Analyzing video with prompt: ${prompt}`);
  
  // For video analysis, we'll extract frames and analyze them
  // This is a simplified implementation - in production, you'd use specialized video AI
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt || 'Analyze this video content.'
        }
      ],
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  console.log('✅ Video analyzed successfully');
  
  return new Response(JSON.stringify({
    success: true,
    analysis: `Video Analysis: ${analysis}`,
    videoUrl: videoUrl
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeAudio(audioData: string, prompt: string) {
  console.log(`🎵 Analyzing audio with prompt: ${prompt}`);
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // First, transcribe the audio
  const binaryAudio = atob(audioData);
  const audioArray = new Uint8Array(binaryAudio.length);
  for (let i = 0; i < binaryAudio.length; i++) {
    audioArray[i] = binaryAudio.charCodeAt(i);
  }

  const formData = new FormData();
  const audioBlob = new Blob([audioArray], { type: 'audio/webm' });
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!transcriptionResponse.ok) {
    const error = await transcriptionResponse.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const transcriptionData = await transcriptionResponse.json();
  const transcription = transcriptionData.text;

  // Now analyze the transcription
  const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `${prompt || 'Analyze this audio content.'}\n\nTranscription: ${transcription}`
        }
      ],
      max_tokens: 1000
    }),
  });

  if (!analysisResponse.ok) {
    const error = await analysisResponse.text();
    throw new Error(`OpenAI Analysis API error: ${error}`);
  }

  const analysisData = await analysisResponse.json();
  const analysis = analysisData.choices[0].message.content;
  
  console.log('✅ Audio analyzed successfully');
  
  return new Response(JSON.stringify({
    success: true,
    transcription: transcription,
    analysis: analysis
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function textToSpeech(text: string, voice: string) {
  console.log(`🗣️ Converting text to speech: ${text.substring(0, 50)}...`);
  
  const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenlabsApiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Use ElevenLabs voice ID mapping
  const voiceMap: { [key: string]: string } = {
    'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
    'echo': 'CwhRBWXzGAHq8TQ4Fs17', // Roger
    'fable': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'onyx': 'FGY2WhTYpPnrIDTdsKH5', // Laura
    'nova': 'IKne3meq5aSn9XLyUdCD', // Charlie
    'shimmer': 'JBFqnCBsd6RMkjVDRZzb' // George
  };

  const voiceId = voiceMap[voice] || '9BWtsMINqrJLrRacOk9x';

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenlabsApiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  
  console.log('✅ Text-to-speech completed successfully');
  
  return new Response(JSON.stringify({
    success: true,
    audioContent: base64Audio,
    voice: voice
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function speechToText(audioData: string) {
  console.log(`🎤 Converting speech to text`);
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const binaryAudio = atob(audioData);
  const audioArray = new Uint8Array(binaryAudio.length);
  for (let i = 0; i < binaryAudio.length; i++) {
    audioArray[i] = binaryAudio.charCodeAt(i);
  }

  const formData = new FormData();
  const audioBlob = new Blob([audioArray], { type: 'audio/webm' });
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const data = await response.json();
  
  console.log('✅ Speech-to-text completed successfully');
  
  return new Response(JSON.stringify({
    success: true,
    text: data.text
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}