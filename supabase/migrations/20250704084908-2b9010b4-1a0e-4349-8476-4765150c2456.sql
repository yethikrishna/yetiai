-- Create tables for storing AI model configurations and usage analytics
CREATE TABLE IF NOT EXISTS public.ai_model_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  yeti_display_name VARCHAR(100) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'chat', 'image', 'video', 'embedding'
  context_tokens INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for user AI usage analytics
CREATE TABLE IF NOT EXISTS public.user_ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  usage_type VARCHAR(50) NOT NULL, -- 'chat', 'image_generation', 'video_generation', 'web_scraping'
  tokens_used INTEGER DEFAULT 0,
  request_count INTEGER DEFAULT 1,
  cost_estimate DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for memory management
CREATE TABLE IF NOT EXISTS public.user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type VARCHAR(50) NOT NULL, -- 'conversation', 'document', 'web_page', 'note'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_model_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_model_configurations (public read access)
CREATE POLICY "AI model configurations are viewable by everyone" 
ON public.ai_model_configurations 
FOR SELECT 
USING (true);

-- RLS policies for user_ai_usage (user-specific)
CREATE POLICY "Users can view their own AI usage" 
ON public.user_ai_usage 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own AI usage" 
ON public.user_ai_usage 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- RLS policies for user_memories (user-specific)
CREATE POLICY "Users can view their own memories" 
ON public.user_memories 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own memories" 
ON public.user_memories 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own memories" 
ON public.user_memories 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own memories" 
ON public.user_memories 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Insert the AI model configurations with Yeti-themed names
INSERT INTO public.ai_model_configurations (provider, model_name, yeti_display_name, model_type, context_tokens) VALUES
-- OpenRouter Models (using Yeti Ice/Snow themed names)
('openrouter', 'deepseek/deepseek-chat-v3-0324:free', 'Yeti Glacier Pro', 'chat', 32000),
('openrouter', 'deepseek/deepseek-r1-0528:free', 'Yeti Arctic Reasoning', 'chat', 32000),
('openrouter', 'google/gemini-2.0-flash-exp:free', 'Yeti Blizzard Flash', 'chat', 32000),
('openrouter', 'qwen/qwen3-32b:free', 'Yeti Frost Giant', 'chat', 32000),
('openrouter', 'mistralai/mistral-nemo:free', 'Yeti Ice Storm', 'chat', 32000),
('openrouter', 'meta-llama/llama-4-maverick:free', 'Yeti Snow Leopard', 'chat', 32000),
('openrouter', 'qwen/qwen2.5-vl-72b-instruct:free', 'Yeti Avalanche Vision', 'chat', 32000),
('openrouter', 'nvidia/llama-3.3-nemotron-super-49b-v1:free', 'Yeti Crystal Core', 'chat', 32000),

-- Gemini Models (using Yeti Crystal themed names)
('gemini', 'gemini-1.5-pro', 'Yeti Crystal Mind Pro', 'chat', 32000),
('gemini', 'gemini-1.5-flash', 'Yeti Crystal Flash', 'chat', 32000),
('gemini', 'gemini-1.0-pro-vision', 'Yeti Crystal Vision', 'chat', 32000),

-- Novita Models (using Yeti Ember themed names)
('novita', 'ERNIE 4.5 VL 28B A3B', 'Yeti Ember Vision', 'chat', 30000),
('novita', 'ERNIE 4.5 21B A3B', 'Yeti Ember Mind', 'chat', 120000),
('novita', 'qwen/qwen3-4b-fp8', 'Yeti Ember Swift', 'chat', 128000),
('novita', 'meta-llama/llama-3.2-1b-instruct', 'Yeti Ember Lite', 'chat', 131000),
('novita', 'BAAI:BGE-M3', 'Yeti Ember Search', 'embedding', 8192),

-- A4F Image Models (using Yeti Art themed names)
('a4f', 'provider-2/FLUX.1-schnell-v2', 'Yeti Art Studio Pro', 'image', 0),
('a4f', 'provider-1/FLUX.1-kontext-pro', 'Yeti Art Master', 'image', 0),
('a4f', 'provider-1/FLUX.1.1-pro', 'Yeti Art Creator', 'image', 0),
('a4f', 'provider-3/FLUX.1-dev', 'Yeti Art Designer', 'image', 0),
('a4f', 'provider-1/FLUX.1-schnell', 'Yeti Art Express', 'image', 0),

-- A4F Video Models (using Yeti Motion themed names)
('a4f', 'provider-6/i2vgen-xl', 'Yeti Motion Studio', 'video', 0);

-- Create indexes for better performance
CREATE INDEX idx_ai_model_configurations_provider ON public.ai_model_configurations(provider);
CREATE INDEX idx_ai_model_configurations_type ON public.ai_model_configurations(model_type);
CREATE INDEX idx_user_ai_usage_user_id ON public.user_ai_usage(user_id);
CREATE INDEX idx_user_ai_usage_created_at ON public.user_ai_usage(created_at);
CREATE INDEX idx_user_memories_user_id ON public.user_memories(user_id);
CREATE INDEX idx_user_memories_type ON public.user_memories(memory_type);