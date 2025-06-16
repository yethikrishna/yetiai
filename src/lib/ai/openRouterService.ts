
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

export class OpenRouterService implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key not available');
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `The user has connected these platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "The user hasn't connected any platforms yet.";

      const systemPrompt = `You are Yeti, a friendly and knowledgeable AI assistant. You can help with both general questions and platform automation tasks.

Key characteristics:
- Use the 🧊 or ❄️ emoji occasionally to match your icy theme
- Be helpful, informative, and enthusiastic
- Answer general knowledge questions accurately and concisely
- For platform-related questions, focus on integrations and automations
- If platforms are connected, suggest specific actions you could help with
- If no platforms are connected, encourage users to connect platforms to unlock automation features

Current context: ${platformContext}

You should:
1. Answer general knowledge questions directly and accurately
2. Help with platform integrations and automations when relevant
3. Be conversational and keep responses under 200 words unless detailed information is requested
4. Provide factual, helpful information on any topic while maintaining your friendly Yeti personality`;

      const payload = {
        models: [
          "google/gemini-2.0-flash-exp",
          "deepseek/deepseek-chat",
          "meta-llama/llama-3.3-8b-instruct",
          "microsoft/phi-4-reasoning",
          "mistralai/devstral-small"
        ],
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 400,
        stream: false
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "🧊 I'm having trouble generating a response right now. Please try again!";
    } catch (error) {
      console.error('OpenRouter service error:', error);
      throw error;
    }
  }
}
