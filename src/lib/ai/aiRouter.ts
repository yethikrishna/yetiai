import { AIProvider } from './types';
import { Platform } from '@/types/platform';
import { geminiService } from './geminiService';
import { sarvamService } from './sarvamService';
import { groqService } from '../groq/groqService';
import { OpenRouterService } from './openRouterService';

interface RouteDecision {
  provider: AIProvider;
  model?: string;
  confidence: number;
  reasoning: string;
}

class AIRouter {
  private providers: AIProvider[] = [];
  private fallbackOrder: string[] = ['Yeti-Core', 'Yeti-Local', 'Groq', 'OpenRouter'];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize all available providers
    this.providers = [
      geminiService,
      sarvamService,
      groqService,
      // Add OpenRouter if available
      ...(localStorage.getItem('openrouter-api-key') ? [new OpenRouterService(localStorage.getItem('openrouter-api-key')!)] : [])
    ];
  }

  async routeRequest(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    const decision = this.analyzeAndRoute(userMessage);
    
    console.log(`🧠 Yeti routing to: ${decision.provider.name} (confidence: ${decision.confidence})`);
    
    try {
      // Try primary choice
      if (decision.provider.isAvailable()) {
        // Set the model on the provider if it supports model selection
        if (decision.model && 'setModel' in decision.provider) {
          (decision.provider as any).setModel(decision.model);
        }
        return await decision.provider.generateResponse(userMessage, connectedPlatforms);
      }
    } catch (error) {
      console.log(`⚠️ ${decision.provider.name} failed, falling back...`);
    }

    // Fallback to other available providers
    for (const providerName of this.fallbackOrder) {
      const provider = this.providers.find(p => p.name === providerName);
      if (provider && provider.isAvailable() && provider !== decision.provider) {
        try {
          console.log(`🔄 Yeti falling back to: ${provider.name}`);
          return await provider.generateResponse(userMessage, connectedPlatforms);
        } catch (error) {
          console.log(`⚠️ ${provider.name} also failed, trying next...`);
          continue;
        }
      }
    }

    return "🧊 Yeti is currently experiencing technical difficulties. Please try again in a moment.";
  }

  private analyzeAndRoute(userMessage: string): RouteDecision {
    const message = userMessage.toLowerCase();
    const length = userMessage.length;

    // Check for Indian language content first (highest priority)
    if (sarvamService.hasIndicContent(userMessage) || this.hasIndianContext(message)) {
      return {
        provider: sarvamService,
        confidence: 0.95,
        reasoning: 'Indian language or context detected'
      };
    }

    // Image generation requests
    if (this.isImageRequest(message)) {
      return {
        provider: geminiService,
        model: 'flash-2.0',
        confidence: 0.9,
        reasoning: 'Image generation request detected'
      };
    }

    // Quick/lightweight tasks
    if (this.isQuickTask(message, length)) {
      return {
        provider: geminiService,
        model: 'flash-lite',
        confidence: 0.85,
        reasoning: 'Quick task detected'
      };
    }

    // Complex reasoning or coding tasks
    if (this.isComplexTask(message)) {
      return {
        provider: geminiService,
        model: 'flash-2.5',
        confidence: 0.9,
        reasoning: 'Complex reasoning or coding task detected'
      };
    }

    // Default to Gemini for general tasks
    return {
      provider: geminiService,
      model: 'flash-2.5',
      confidence: 0.7,
      reasoning: 'General purpose task'
    };
  }

  private hasIndianContext(message: string): boolean {
    const indianKeywords = [
      'india', 'indian', 'hindi', 'bengali', 'tamil', 'telugu', 'kannada', 
      'malayalam', 'marathi', 'gujarati', 'punjabi', 'sanskrit', 'bollywood',
      'ayurveda', 'yoga', 'cricket', 'rupee', 'delhi', 'mumbai', 'bangalore'
    ];
    return indianKeywords.some(keyword => message.includes(keyword));
  }

  private isImageRequest(message: string): boolean {
    const imageKeywords = ['create image', 'generate image', 'draw', 'visualize', 'picture of', 'make a picture'];
    return imageKeywords.some(keyword => message.includes(keyword));
  }

  private isQuickTask(message: string, length: number): boolean {
    if (length < 50) return true;
    
    const quickKeywords = ['quick', 'short', 'brief', 'summarize', 'what is', 'who is', 'simple'];
    return quickKeywords.some(keyword => message.includes(keyword));
  }

  private isComplexTask(message: string): boolean {
    const complexKeywords = [
      'code', 'program', 'algorithm', 'explain', 'analyze', 'compare', 'design',
      'strategy', 'plan', 'solve', 'debug', 'implement', 'architecture'
    ];
    return complexKeywords.some(keyword => message.includes(keyword));
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }

  getProviderStatus(): { [key: string]: boolean } {
    return this.providers.reduce((status, provider) => {
      status[provider.name] = provider.isAvailable();
      return status;
    }, {} as { [key: string]: boolean });
  }
}

export const aiRouter = new AIRouter();
