
import Groq from 'groq-sdk';
import { Platform } from '@/types/platform';

// Default API key - replace with your actual Groq API key
const DEFAULT_GROQ_API_KEY = 'gsk_your_default_api_key_here';

export class GroqService {
  private groq: Groq | null = null;

  constructor(apiKey?: string) {
    const keyToUse = apiKey || DEFAULT_GROQ_API_KEY;
    this.groq = new Groq({ apiKey: keyToUse, dangerouslyAllowBrowser: true });
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
1. Answer general knowledge questions directly and accurately (like "Who is Donald Trump?" - answer that he's the 45th and 47th President of the United States)
2. Help with platform integrations and automations when relevant
3. Be conversational and keep responses under 200 words unless detailed information is requested
4. Provide factual, helpful information on any topic while maintaining your friendly Yeti personality`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 400,
      });

      return completion.choices[0]?.message?.content || "🧊 I'm having trouble generating a response right now. Please try again!";
    } catch (error) {
      console.error('Groq API error:', error);
      return "🧊 I encountered an error while processing your request. Please check your API key and try again.";
    }
  }
}

// Create a singleton instance with default API key
export const groqService = new GroqService();
