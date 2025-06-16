
-- Create a table to store conversation memory
CREATE TABLE public.conversation_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversation_memory
CREATE POLICY "Users can view their own conversation memory" 
  ON public.conversation_memory 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation memory" 
  ON public.conversation_memory 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation memory" 
  ON public.conversation_memory 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation memory" 
  ON public.conversation_memory 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_conversation_memory_user_id ON public.conversation_memory(user_id);
CREATE INDEX idx_conversation_memory_session_id ON public.conversation_memory(session_id);
CREATE INDEX idx_conversation_memory_updated_at ON public.conversation_memory(updated_at);

-- Create unique constraint for user_id and session_id combination
ALTER TABLE public.conversation_memory ADD CONSTRAINT unique_user_session 
  UNIQUE (user_id, session_id);
