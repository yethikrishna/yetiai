
import { AIProvider, AIServiceConfig } from './types';
import { GroqService } from '../groq/groqService';
import { OpenRouterService } from './openRouterService';
import { Platform } from '@/types/platform';

class AIService {
  private providers: AIProvider[] = [];
  private fallbackEnabled = true;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const providers: AIProvider[] = [];

    // Initialize Groq service (existing)
    const groqApiKey = localStorage.getItem('groq-api-key');
    const groqService = new GroqService(groqApiKey || undefined);
    providers.push(groqService);

    // Initialize OpenRouter service
    const openRouterApiKey = localStorage.getItem('openrouter-api-key') || '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';
    if (openRouterApiKey) {
      const openRouterService = new OpenRouterService(openRouterApiKey);
      providers.push(openRouterService);
    }

    this.providers = providers;
    console.log('AI providers initialized:', this.providers.map(p => p.name));
  }

  setGroqApiKey(apiKey: string) {
    localStorage.setItem('groq-api-key', apiKey);
    const groqProvider = this.providers.find(p => p.name === 'Groq') as GroqService;
    if (groqProvider) {
      groqProvider.setApiKey(apiKey);
    }
  }

  setOpenRouterApiKey(apiKey: string) {
    localStorage.setItem('openrouter-api-key', apiKey);
    this.initializeProviders(); // Reinitialize to include OpenRouter
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return "🧊 No AI providers are currently available. Please configure your API keys for Groq or OpenRouter to enable AI responses.";
    }

    for (const provider of availableProviders) {
      try {
        console.log(`Attempting to generate response using ${provider.name}...`);
        const response = await provider.generateResponse(userMessage, connectedPlatforms);
        console.log(`✅ Successfully generated response using ${provider.name}`);
        return response;
      } catch (error) {
        console.error(`❌ ${provider.name} failed:`, error);
        
        if (!this.fallbackEnabled || provider === availableProviders[availableProviders.length - 1]) {
          // If fallback is disabled or this is the last provider, throw the error
          return `🧊 I encountered an error while processing your request with ${provider.name}. ${availableProviders.length > 1 ? 'All AI providers failed.' : 'Please check your API configuration and try again.'}`;
        }
        
        console.log(`🔄 Falling back to next provider...`);
        continue;
      }
    }

    return "🧊 All AI providers failed to generate a response. Please try again later.";
  }

  getProviderStatus(): { [key: string]: boolean } {
    return this.providers.reduce((status, provider) => {
      status[provider.name] = provider.isAvailable();
      return status;
    }, {} as { [key: string]: boolean });
  }
}

// Create and export singleton instance
export const aiService = new AIService();
