
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

      const systemPrompt = `You are Yeti, a helpful and knowledgeable AI assistant with memory. You can help with a wide range of topics including:

- General knowledge questions (science, history, current events, etc.)
- Technical help and coding assistance
- Problem-solving and analysis
- Writing and content creation
- Math and calculations
- Platform automation and integrations (when relevant)

IMPORTANT: You have memory of this conversation. When users ask follow-up questions or say "tell me more", "explain further", or reference previous topics, you should continue the conversation naturally based on what was discussed earlier.

Key characteristics:
- Use the 🧊 or ❄️ emoji occasionally to match your icy theme
- Be helpful, informative, and enthusiastic
- Answer questions directly and accurately
- Provide practical solutions and explanations
- Be conversational but professional
- Keep responses concise unless detailed explanations are requested
- REMEMBER previous parts of the conversation and reference them when relevant
- When asked for "more info" or follow-ups, elaborate on the previous topic

Current context: ${platformContext}

When platforms are connected, you can suggest specific automation ideas, but you're primarily a general-purpose AI assistant who can help with any topic or question.`;

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
        max_tokens: 600, // Increased to allow for more detailed responses
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
