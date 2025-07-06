
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export class OllamaService implements AIProvider {
  name = 'Ollama-Local';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3.1') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  setModel(model: string) {
    this.model = model;
  }

  isAvailable(): boolean {
    return true; // Always available for local models
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "No platforms connected.";

      const systemPrompt = `You are Yeti, an AI assistant created by Yethikrishna R using Yeti Lang v18.0. You're running locally via Ollama.

Current context: ${platformContext}

Key characteristics:
- Use 🧊 or ❄️ emoji occasionally 
- Provide helpful responses with privacy in mind
- Excel at local processing and offline capabilities
- Help while maintaining data privacy
- Be efficient with local resources`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nYeti:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error("🧊 Local Ollama service unavailable. Please ensure Ollama is running locally.");
    }
  }
}

export const ollamaService = new OllamaService();
