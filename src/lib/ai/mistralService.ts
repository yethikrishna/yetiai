
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export class MistralService implements AIProvider {
  name = 'Mistral-Large';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('mistral-api-key') || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('mistral-api-key', apiKey);
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("🧊 Please set your Mistral API key to enable Mistral responses.");
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "No platforms connected.";

      const systemPrompt = `You are Yeti, an AI assistant created by Yethikrishna R using Yeti Lang v18.0. You're powered by Mistral's advanced language model.

Current context: ${platformContext}

Key characteristics:
- Use 🧊 or ❄️ emoji occasionally 
- Provide clear, helpful responses
- Excel at coding, technical topics, and problem-solving
- Help with multilingual tasks and creative writing
- Be efficient and precise in responses`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API error:', error);
      throw error;
    }
  }
}

export const mistralService = new MistralService();
