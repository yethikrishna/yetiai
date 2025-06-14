
import Groq from 'groq-sdk';
import { Platform } from '@/types/platform';

export class GroqService {
  private groq: Groq | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    }
  }

  setApiKey(apiKey: string) {
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.groq) {
      return "🧊 Please set your Groq API key to enable AI responses. You can get a free API key from https://console.groq.com/";
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `The user has connected these platforms: ${connectedPlatforms.map(p => p.name).join(', ')}.`
        : "The user hasn't connected any platforms yet.";

      const systemPrompt = `You are Yeti, a friendly AI assistant that helps users manage and automate tasks across multiple platforms. 

Key characteristics:
- Use the 🧊 or ❄️ emoji occasionally to match your icy theme
- Be helpful, concise, and enthusiastic
- Focus on how you can help with platform integrations and automations
- If platforms are connected, suggest specific actions you could help with
- If no platforms are connected, encourage users to connect platforms to unlock your full potential

Current context: ${platformContext}

Keep responses conversational and under 150 words unless the user asks for detailed information.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || "🧊 I'm having trouble generating a response right now. Please try again!";
    } catch (error) {
      console.error('Groq API error:', error);
      return "🧊 I encountered an error while processing your request. Please check your API key and try again.";
    }
  }
}

// Create a singleton instance
export const groqService = new GroqService();
