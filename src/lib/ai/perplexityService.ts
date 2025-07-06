
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export class PerplexityService implements AIProvider {
  name = 'Perplexity-Research';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('perplexity-api-key') || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('perplexity-api-key', apiKey);
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("🧊 Please set your Perplexity API key to enable research capabilities.");
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "No platforms connected.";

      const systemPrompt = `You are Yeti, an AI research assistant created by Yethikrishna R using Yeti Lang v18.0. You excel at finding and analyzing current information.

Current context: ${platformContext}

Key characteristics:
- Use 🧊 or ❄️ emoji occasionally 
- Provide factual, well-researched responses with sources
- Excel at current events and real-time information
- Help with research, fact-checking, and analysis
- Be accurate and cite sources when possible`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }
}

export const perplexityService = new PerplexityService();
