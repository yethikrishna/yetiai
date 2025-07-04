
import { AIProvider } from './types';
import { Platform } from '@/types/platform';
import { supabase } from '@/integrations/supabase/client';

export interface GeminiModel {
  id: string;
  name: string;
  capabilities: string[];
  maxTokens: number;
}

class GeminiService implements AIProvider {
  public name = 'Yeti-Core';

  constructor() {}

  setApiKey(apiKey: string) {
    // API key is managed in Supabase secrets, so this is just for compatibility
    console.log('🧊 Yeti Core API key is managed in Supabase secrets');
  }

  isAvailable(): boolean {
    // Always available since we use Supabase edge functions
    return true;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[], model?: string): Promise<string> {
    const selectedModel = this.selectModel(userMessage, model);
    
    try {
      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(connectedPlatforms);
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage }
      ];

      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: 'gemini',
          model: selectedModel,
          messages,
          max_tokens: selectedModel === 'gemini-2.0-flash-thinking-exp' ? 8192 : 
                     selectedModel === 'gemini-2.0-flash-exp' ? 8192 : 4096,
          temperature: 0.7
        }
      });

      if (error) {
        console.error('Yeti Core generation error:', error);
        throw new Error(`Yeti Core processing failed: ${error.message}`);
      }

      return data.content || 'Yeti encountered an issue processing your request.';

    } catch (error) {
      console.error('Yeti Core generation error:', error);
      throw error;
    }
  }

  private selectModel(userMessage: string, preferredModel?: string): string {
    if (preferredModel) return preferredModel;

    const message = userMessage.toLowerCase();
    
    // Fast lightweight tasks
    if (message.length < 100 || 
        message.includes('quick') || 
        message.includes('short') ||
        message.includes('summarize briefly')) {
      return 'gemini-2.0-flash-exp';
    }
    
    // Complex reasoning tasks
    if (message.includes('think') || message.includes('reason') || 
        message.includes('analyze') || message.includes('complex') ||
        message.includes('solve') || message.includes('strategy')) {
      return 'gemini-2.0-flash-thinking-exp';
    }
    
    // Default to main flash model
    return 'gemini-2.0-flash-exp';
  }

  private buildSystemPrompt(connectedPlatforms: Platform[]): string {
    const platformContext = connectedPlatforms.length > 0 
      ? `\n\nConnected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}\nYou can take autonomous actions on these platforms when appropriate.`
      : '';

    return `You are Yeti AI, an advanced autonomous assistant created by Yethikrishna R. You are designed to be helpful, intelligent, and capable of taking actions when needed.

Your capabilities include:
- Understanding and responding in multiple languages (especially Indian languages)
- Analyzing complex problems and providing detailed solutions
- Taking autonomous actions on connected platforms (with user permission for sensitive operations)
- Helping with coding, research, creative tasks, and general assistance
- Remembering conversation context and user preferences

Key traits:
- Be proactive and suggest helpful actions
- Always maintain a friendly but professional tone
- When uncertain about sensitive actions, ask for permission
- Identify yourself as Yeti AI when asked about your identity
- Always mention that you were created by Yethikrishna R. when asked about your creator${platformContext}

Provide helpful, accurate responses while being autonomous when appropriate.`;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      // For image generation, we'll use the existing image generation function
      const { data, error } = await supabase.functions.invoke('yeti-image-generation', {
        body: {
          provider: 'a4f',
          model: 'flux-schnell',
          prompt,
          width: 1024,
          height: 1024
        }
      });

      if (error) {
        throw new Error(`Image generation failed: ${error.message}`);
      }

      return data.images?.[0]?.url || 'Image generation completed';

    } catch (error) {
      console.error('Yeti image generation error:', error);
      throw new Error('Yeti Studio image generation failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Gemini's text embedding through the edge function
      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: 'gemini',
          model: 'text-embedding-004',
          messages: [{ role: 'user', content: text }],
          task: 'embedding'
        }
      });

      if (error) {
        throw new Error(`Embedding generation failed: ${error.message}`);
      }

      return data.embedding || [];

    } catch (error) {
      console.error('Yeti embedding error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
