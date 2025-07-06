import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      file, 
      fileName, 
      fileType, 
      userId,
      analysisPrompt = 'Analyze this file content in detail.'
    } = await req.json();

    console.log(`📁 Yeti File Handler: ${action} request for ${fileName}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'upload_file':
        return await uploadFile(file, fileName, fileType, userId, supabase);
      
      case 'analyze_file':
        return await analyzeFile(file, fileName, fileType, analysisPrompt);
      
      case 'process_document':
        return await processDocument(file, fileName, fileType, analysisPrompt);
      
      case 'extract_text':
        return await extractText(file, fileName, fileType);
      
      case 'get_file_info':
        return await getFileInfo(fileName, userId, supabase);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Yeti File Handler error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function uploadFile(
  fileData: string, 
  fileName: string, 
  fileType: string, 
  userId: string,
  supabase: any
) {
  console.log(`⬆️ Uploading file: ${fileName} (${fileType})`);

  try {
    // Decode base64 file data
    const binaryData = atob(fileData);
    const fileArray = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      fileArray[i] = binaryData.charCodeAt(i);
    }

    // Create file path with user ID
    const filePath = `${userId}/${Date.now()}_${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(filePath, fileArray, {
        contentType: fileType,
        cacheControl: '3600'
      });

    if (error) {
      throw new Error(`Storage upload error: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);

    console.log('✅ File uploaded successfully');

    return new Response(JSON.stringify({
      success: true,
      fileUrl: publicUrl,
      filePath: filePath,
      fileName: fileName,
      fileType: fileType,
      uploadedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function analyzeFile(
  fileData: string, 
  fileName: string, 
  fileType: string, 
  prompt: string
) {
  console.log(`🔍 Analyzing file: ${fileName} (${fileType})`);

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  let analysis = '';

  try {
    if (fileType.startsWith('image/')) {
      // Analyze image
      const imageUrl = `data:${fileType};base64,${fileData}`;
      
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
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Vision API error: ${await response.text()}`);
      }

      const data = await response.json();
      analysis = data.choices[0].message.content;

    } else if (fileType.startsWith('audio/')) {
      // Analyze audio
      const binaryData = atob(fileData);
      const audioArray = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        audioArray[i] = binaryData.charCodeAt(i);
      }

      const formData = new FormData();
      const audioBlob = new Blob([audioArray], { type: fileType });
      formData.append('file', audioBlob, fileName);
      formData.append('model', 'whisper-1');

      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Whisper API error: ${await transcriptionResponse.text()}`);
      }

      const transcriptionData = await transcriptionResponse.json();
      const transcription = transcriptionData.text;

      // Analyze the transcription
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
              content: `${prompt}\n\nAudio transcription: ${transcription}`
            }
          ],
          max_tokens: 1000
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`OpenAI Analysis API error: ${await analysisResponse.text()}`);
      }

      const analysisData = await analysisResponse.json();
      analysis = `**Transcription:** ${transcription}\n\n**Analysis:** ${analysisData.choices[0].message.content}`;

    } else if (fileType === 'text/plain' || fileType === 'application/pdf') {
      // Analyze text/document
      let textContent = '';
      
      if (fileType === 'text/plain') {
        textContent = atob(fileData);
      } else {
        // For PDF, we'll need to extract text first (simplified version)
        textContent = `PDF file: ${fileName} (${Math.round(atob(fileData).length / 1024)}KB)`;
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
              content: `${prompt}\n\nFile content: ${textContent.substring(0, 8000)}`
            }
          ],
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${await response.text()}`);
      }

      const data = await response.json();
      analysis = data.choices[0].message.content;

    } else {
      analysis = `File type ${fileType} analysis not supported yet. Supported types: images, audio, text, PDF.`;
    }

    console.log('✅ File analyzed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      fileName: fileName,
      fileType: fileType,
      fileSize: Math.round(atob(fileData).length / 1024) + 'KB'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

async function processDocument(
  fileData: string, 
  fileName: string, 
  fileType: string, 
  prompt: string
) {
  console.log(`📄 Processing document: ${fileName}`);

  // This would handle document processing like OCR, text extraction, etc.
  // For now, we'll use the same analysis function
  return await analyzeFile(fileData, fileName, fileType, prompt);
}

async function extractText(
  fileData: string, 
  fileName: string, 
  fileType: string
) {
  console.log(`📝 Extracting text from: ${fileName}`);

  let extractedText = '';

  try {
    if (fileType === 'text/plain') {
      extractedText = atob(fileData);
    } else if (fileType.startsWith('image/')) {
      // Use OCR for images
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const imageUrl = `data:${fileType};base64,${fileData}`;
      
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
                { type: 'text', text: 'Extract all text from this image. Return only the text content, no analysis.' },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Vision API error: ${await response.text()}`);
      }

      const data = await response.json();
      extractedText = data.choices[0].message.content;

    } else {
      extractedText = `Text extraction not supported for ${fileType}`;
    }

    console.log('✅ Text extracted successfully');

    return new Response(JSON.stringify({
      success: true,
      extractedText: extractedText,
      fileName: fileName,
      fileType: fileType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

async function getFileInfo(
  fileName: string, 
  userId: string,
  supabase: any
) {
  console.log(`ℹ️ Getting file info for: ${fileName}`);

  try {
    const { data, error } = await supabase.storage
      .from('user-files')
      .list(userId, {
        search: fileName
      });

    if (error) {
      throw new Error(`Storage list error: ${error.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      files: data || [],
      userId: userId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Get file info failed: ${error.message}`);
  }
}