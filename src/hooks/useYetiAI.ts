import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface YetiAIModel {
  id: string;
  provider: string;
  model_name: string;
  yeti_display_name: string;
  model_type: 'chat' | 'image' | 'video' | 'embedding';
  context_tokens: number;
  is_active: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: any;
  model: string;
  provider: string;
}

export interface ImageResponse {
  images: Array<{ url: string; width: number; height: number }>;
  model: string;
  provider: string;
  prompt: string;
}

export interface VideoResponse {
  videos: Array<{ url: string; duration: number; fps: number }>;
  model: string;
  provider: string;
  prompt?: string;
  image_url?: string;
}

export interface WebScrapingResponse {
  url: string;
  content: string;
  action: string;
  success: boolean;
  provider: string;
}

export interface MemoryResponse {
  results?: any[];
  memories?: any[];
  memory?: any;
  id?: string;
  success?: boolean;
  provider: string;
}

export function useYetiAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<YetiAIModel[]>([]);
  const { toast } = useToast();

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_configurations')
        .select('*')
        .eq('is_active', true)
        .order('yeti_display_name');

      if (error) throw error;
      
      // Type-safe mapping
      const typedModels: YetiAIModel[] = (data || []).map(model => ({
        ...model,
        model_type: model.model_type as 'chat' | 'image' | 'video' | 'embedding'
      }));
      
      setModels(typedModels);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "❄️ Model Loading Error",
        description: "Could not load Yeti AI models. Please try again.",
        variant: "destructive",
      });
    }
  };

  const chat = async (
    provider: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<ChatResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider,
          model,
          messages,
          ...options,
        },
      });

      if (error) throw error;
      
      // Log usage analytics
      if (data?.usage) {
        await logUsage(provider, model, 'chat', data.usage);
      }

      toast({
        title: "🧊 Yeti AI Response",
        description: "Message generated successfully!",
      });

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "❄️ Chat Error",
        description: error.message || "Failed to generate response",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (
    model: string,
    prompt: string,
    options?: {
      width?: number;
      height?: number;
      steps?: number;
      guidance_scale?: number;
    }
  ): Promise<ImageResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-image-generation', {
        body: {
          provider: 'a4f',
          model,
          prompt,
          ...options,
        },
      });

      if (error) throw error;
      
      await logUsage('a4f', model, 'image_generation');

      toast({
        title: "🎨 Yeti Art Studio",
        description: "Image generated successfully!",
      });

      return data;
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "❄️ Image Generation Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async (
    model: string,
    options: {
      prompt?: string;
      image_url?: string;
      duration?: number;
      fps?: number;
    }
  ): Promise<VideoResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-video-generation', {
        body: {
          provider: 'a4f',
          model,
          ...options,
        },
      });

      if (error) throw error;
      
      await logUsage('a4f', model, 'video_generation');

      toast({
        title: "🎬 Yeti Motion Studio",
        description: "Video generated successfully!",
      });

      return data;
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "❄️ Video Generation Error",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeWebsite = async (
    url: string,
    prompt?: string,
    action?: 'scrape' | 'interact' | 'extract'
  ): Promise<WebScrapingResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-web-scraper', {
        body: {
          url,
          prompt: prompt || "Extract the main content from this page",
          action: action || 'scrape',
        },
      });

      if (error) throw error;
      
      await logUsage('airtop', 'web-scraper', 'web_scraping');

      toast({
        title: "🔍 Yeti Web Scraper",
        description: "Website content extracted successfully!",
      });

      return data;
    } catch (error) {
      console.error('Web scraping error:', error);
      toast({
        title: "❄️ Web Scraping Error",
        description: error.message || "Failed to scrape website",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchMemory = async (query: string, limit = 10): Promise<MemoryResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-memory-service', {
        body: {
          action: 'search',
          query,
          limit,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Memory search error:', error);
      toast({
        title: "❄️ Memory Search Error",
        description: error.message || "Failed to search memories",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const storeMemory = async (
    content: string,
    title?: string,
    type?: string
  ): Promise<MemoryResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-memory-service', {
        body: {
          action: 'store',
          content,
          title,
          type,
        },
      });

      if (error) throw error;

      toast({
        title: "🧠 Yeti Memory",
        description: "Memory stored successfully!",
      });

      return data;
    } catch (error) {
      console.error('Memory store error:', error);
      toast({
        title: "❄️ Memory Store Error",
        description: error.message || "Failed to store memory",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logUsage = async (
    provider: string,
    model: string,
    usage_type: string,
    usage_data?: any
  ) => {
    try {
      const { error } = await supabase.from('user_ai_usage').insert({
        user_id: 'anonymous', // Replace with actual user ID when auth is implemented
        provider,
        model_name: model,
        usage_type,
        tokens_used: usage_data?.total_tokens || 0,
        request_count: 1,
        cost_estimate: 0, // Calculate based on provider pricing
      });

      if (error) console.error('Usage logging error:', error);
    } catch (error) {
      console.error('Usage logging error:', error);
    }
  };

  const getModelsByType = (type: 'chat' | 'image' | 'video' | 'embedding') => {
    return models.filter(model => model.model_type === type);
  };

  return {
    models,
    isLoading,
    loadModels,
    chat,
    generateImage,
    generateVideo,
    scrapeWebsite,
    searchMemory,
    storeMemory,
    getModelsByType,
  };
}