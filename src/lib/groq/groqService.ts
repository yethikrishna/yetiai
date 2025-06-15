
import Groq from 'groq-sdk';
import { Platform } from '@/types/platform';

class GroqService {
  private groq: Groq;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq-api-key');
    
    if (this.apiKey) {
      this.groq = new Groq({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      // Create a placeholder instance
      this.groq = {} as Groq;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('groq-api-key', apiKey);
    this.groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private checkForSpecificQuestions(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Check for "who built/created you" questions
    if ((lowerMessage.includes('who built') || lowerMessage.includes('who created') || lowerMessage.includes('who made')) && 
        (lowerMessage.includes('you') || lowerMessage.includes('yeti'))) {
      return "🧊 I was built by Yethikrishna R as a side project. It's been an exciting journey creating an AI assistant that can help with various tasks!";
    }
    
    // Check for "when were you created" questions
    if ((lowerMessage.includes('when') && (lowerMessage.includes('created') || lowerMessage.includes('built') || lowerMessage.includes('made'))) &&
        (lowerMessage.includes('you') || lowerMessage.includes('yeti'))) {
      return "🧊 I was created by Yethikrishna R as a side project. The development has been an ongoing process of improvements and new features!";
    }
    
    // Check for AI model questions
    if ((lowerMessage.includes('what ai') || lowerMessage.includes('which ai') || lowerMessage.includes('what model') || 
         lowerMessage.includes('which model') || lowerMessage.includes('llm')) && 
        (lowerMessage.includes('you use') || lowerMessage.includes('are you') || lowerMessage.includes('powers you') || 
         lowerMessage.includes('behind you') || lowerMessage.includes('yeti'))) {
      return "🧊 I'm powered by YETI LANG TEXT V18.0 - a custom LLM model trained by Yethikrishna R and the team specifically for multi-platform AI assistance!";
    }
    
    return null;
  }

  async generateResponse(message: string, connectedPlatforms: Platform[]): Promise<string> {
    // First check if this is one of our specific questions
    const specificResponse = this.checkForSpecificQuestions(message);
    if (specificResponse) {
      return specificResponse;
    }

    // If no API key, return a helpful message
    if (!this.hasApiKey()) {
      return "🧊 I need a Groq API key to provide intelligent responses. Please add your API key in the settings to unlock my full capabilities!";
    }

    try {
      const platformContext = connectedPlatforms.length > 0 
        ? `Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}`
        : 'No platforms currently connected';

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are Yeti, a friendly AI assistant that helps users with various tasks across multiple platforms. You have a cool, helpful personality and use the 🧊 emoji occasionally. ${platformContext}. Keep responses concise and helpful.`
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || "🧊 I'm having trouble generating a response right now. Please try again!";
    } catch (error) {
      console.error('Groq API error:', error);
      return "🧊 I encountered an error while processing your request. Please check your API key and try again!";
    }
  }
}

export const groqService = new GroqService();
