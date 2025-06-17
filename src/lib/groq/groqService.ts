
import Groq from 'groq-sdk';
import { Platform } from '@/types/platform';
import { AIProvider } from '../ai/types';

// Default API key - replace with your actual Groq API key
const DEFAULT_GROQ_API_KEY = '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';

export class GroqService implements AIProvider {
  name = 'Groq';
  private groq: Groq | null = null;

  constructor(apiKey?: string) {
    const keyToUse = apiKey || DEFAULT_GROQ_API_KEY;
    this.groq = new Groq({ apiKey: keyToUse, dangerouslyAllowBrowser: true });
  }

  setApiKey(apiKey: string) {
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }

  isAvailable(): boolean {
    return !!this.groq;
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("🧊 Please set your Groq API key to enable AI responses. You can get a free API key from https://console.groq.com/");
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

SPECIFIC RESPONSES FOR CERTAIN QUESTIONS:
- If asked "who created you" or "who created it" or similar questions about your creator: Always respond "I was created by Yethikrishna R and team of developers."
- If asked "what LLM do you use" or "what language model" or similar questions about your underlying technology: Always respond "I use Yeti lang v18.0."

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

      // The userMessage already contains conversation history from memoryService
      const completion = await this.groq!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 600, // Increased to allow for more detailed responses
      });

      return completion.choices[0]?.message?.content || "🧊 I'm having trouble generating a response right now. Please try again!";
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }
}

// Create a singleton instance with default API key
export const groqService = new GroqService();
