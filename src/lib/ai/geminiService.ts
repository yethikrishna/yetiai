
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export interface GeminiModel {
  id: string;
  name: string;
  capabilities: string[];
  maxTokens: number;
}

class GeminiService implements AIProvider {
  public name = 'Yeti-Core';
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKeyFromEnv();
  }

  private getApiKeyFromEnv(): string | null {
    // Try multiple environment variable names for flexibility
    return process.env.REACT_APP_YETI_GEMINI_KEY || 
           process.env.GEMINI_API_KEY || 
           localStorage.getItem('yeti-core-key') || 
           null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('yeti-core-key', apiKey);
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  private async makeRequest(endpoint: string, payload: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Yeti Core service unavailable');
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Yeti Core API Error:', error);
      throw new Error(`Yeti Core processing failed: ${response.status}`);
    }

    return response.json();
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[], model?: string): Promise<string> {
    const selectedModel = this.selectModel(userMessage, model);
    
    try {
      const payload = {
        contents: [{
          parts: [{
            text: this.buildPrompt(userMessage, connectedPlatforms)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: selectedModel === 'flash-lite' ? 1024 : 8192,
        }
      };

      const endpoint = this.getEndpoint(selectedModel);
      const response = await this.makeRequest(endpoint, payload);
      
      return response.candidates?.[0]?.content?.parts?.[0]?.text || 
             'Yeti encountered an issue processing your request.';

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
      return 'flash-lite';
    }
    
    // Image generation requests
    if (message.includes('create') && (message.includes('image') || message.includes('picture') ||
        message.includes('draw') || message.includes('visualize') || message.includes('generate'))) {
      return 'flash-2.0';
    }
    
    // Default to main reasoning model
    return 'flash-2.5';
  }

  private getEndpoint(model: string): string {
    switch (model) {
      case 'flash-lite':
        return 'models/gemini-2.5-flash-lite:generateContent';
      case 'flash-2.0':
        return 'models/gemini-2.0-flash:generateContent';
      case 'flash-2.5':
      default:
        return 'models/gemini-2.5-flash:generateContent';
    }
  }

  private buildPrompt(userMessage: string, connectedPlatforms: Platform[]): string {
    const platformContext = connectedPlatforms.length > 0 
      ? `\n\nConnected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}`
      : '';

    return `You are Yeti AI, an autonomous assistant designed to help users with various tasks.
${platformContext}

User request: ${userMessage}

Provide helpful, accurate responses while maintaining a friendly and professional tone.`;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const payload = {
        contents: [{
          parts: [{
            text: `Generate a high-quality image based on this description: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95
        }
      };

      const response = await this.makeRequest('models/gemini-2.0-flash:generateContent', payload);
      
      // Note: Gemini doesn't actually generate images in this way - this is a placeholder
      // In reality, you'd need to use a different service or API for image generation
      return response.candidates?.[0]?.content?.parts?.[0]?.text || 
             'Image generation processed by Yeti Studio';

    } catch (error) {
      console.error('Yeti image generation error:', error);
      throw new Error('Yeti Studio image generation failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const payload = {
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      };

      const response = await this.makeRequest('models/text-embedding-004:embedContent', payload);
      return response.embedding?.values || [];

    } catch (error) {
      console.error('Yeti embedding error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
