
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export class ClaudeService implements AIProvider {
  name = 'Claude-3.5';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('claude-api-key') || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('claude-api-key', apiKey);
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("🧊 Please set your Claude API key to enable Claude responses.");
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "No platforms connected.";

      const systemPrompt = `You are Yeti, an advanced AI assistant created by Yethikrishna R using Yeti Lang v18.0. You excel at reasoning, analysis, and helping with complex tasks.

Current context: ${platformContext}

Key characteristics:
- Use 🧊 or ❄️ emoji occasionally 
- Provide thoughtful, detailed responses
- Excel at reasoning and problem-solving
- Help with writing, coding, analysis, and research
- Be conversational yet professional`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser: ${userMessage}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService();
