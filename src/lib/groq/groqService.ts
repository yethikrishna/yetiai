
import Groq from 'groq-sdk';
import { Platform } from '@/types/platform';

class GroqService {
  private groq: Groq | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.initializeApiKey();
  }

  private initializeApiKey() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq-api-key');
    
    if (this.apiKey) {
      try {
        this.groq = new Groq({
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.error('Failed to initialize Groq client:', error);
        this.groq = null;
        this.apiKey = null;
      }
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('groq-api-key', apiKey);
    try {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.error('Failed to set Groq API key:', error);
      this.groq = null;
      this.apiKey = null;
      throw new Error('Invalid API key format');
    }
  }

  hasApiKey(): boolean {
    return !!(this.apiKey && this.groq);
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
      if (!this.groq) {
        throw new Error('Groq client not initialized');
      }

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

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content received from Groq API');
      }

      return responseContent;
    } catch (error) {
      console.error('Groq API error:', error);
      
      // Check if it's an API key issue
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('API key')) {
          return "🧊 It looks like there's an issue with the API key. Please check that your Groq API key is valid and try again!";
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          return "🧊 I'm getting rate limited by the API. Please wait a moment and try again!";
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "🧊 I'm having trouble connecting to the API. Please check your internet connection and try again!";
        }
      }
      
      return "🧊 I encountered an error while processing your request. Please try again, and if the issue persists, check your API key!";
    }
  }
}

export const groqService = new GroqService();
