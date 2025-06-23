
import { AIProvider, AIServiceConfig } from './types';
import { GroqService } from '../groq/groqService';
import { OpenRouterService } from './openRouterService';
import { memoryService } from './memoryService';
import { Platform } from '@/types/platform';
import { aiRouter } from './aiRouter';
import { geminiService } from './geminiService';
import { sarvamService } from './sarvamService';
import { claudeService } from './claudeService';
import { perplexityService } from './perplexityService';
import { mistralService } from './mistralService';
import { ollamaService } from './ollamaService';
import { advancedAnalytics } from '../analytics/AdvancedAnalytics';
import { securityMonitor } from '../security/SecurityMonitor';

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

    // Add the new AI providers
    providers.push(geminiService);
    providers.push(sarvamService);
    providers.push(claudeService);
    providers.push(perplexityService);
    providers.push(mistralService);
    providers.push(ollamaService);

    this.providers = providers;
    console.log('🧊 Yeti AI engines initialized:', this.providers.filter(p => p.isAvailable()).map(p => p.name));
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

  setGeminiApiKey(apiKey: string) {
    geminiService.setApiKey(apiKey);
    console.log('🧊 Yeti Core engine configured');
  }

  setSarvamApiKey(apiKey: string) {
    sarvamService.setApiKey(apiKey);
    console.log('🧊 Yeti Local engine configured');
  }

  setClaudeApiKey(apiKey: string) {
    claudeService.setApiKey(apiKey);
    console.log('🧊 Claude-3.5 engine configured');
  }

  setPerplexityApiKey(apiKey: string) {
    perplexityService.setApiKey(apiKey);
    console.log('🧊 Perplexity Research engine configured');
  }

  setMistralApiKey(apiKey: string) {
    mistralService.setApiKey(apiKey);
    console.log('🧊 Mistral engine configured');
  }

  setOllamaConfig(baseUrl: string, model?: string) {
    localStorage.setItem('ollama-base-url', baseUrl);
    if (model) {
      ollamaService.setModel(model);
    }
    console.log('🧊 Ollama Local engine configured');
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[], userId?: string): Promise<string> {
    const startTime = Date.now();
    
    // Security validation
    if (!securityMonitor.validateInput(userMessage, 'ai_request')) {
      throw new Error('🔒 Request blocked by security filters');
    }

    // Rate limiting check
    const identifier = userId || 'anonymous';
    if (!securityMonitor.checkRateLimit(identifier, 50, 60000)) {
      throw new Error('🔒 Rate limit exceeded. Please try again later.');
    }

    // Add user message to memory
    memoryService.addToMemory('user', userMessage);

    // Build enhanced prompt with memory context
    const memoryContext = memoryService.buildContextPrompt(userId);
    const enhancedMessage = userMessage + memoryContext;

    let selectedProvider: string = 'unknown';
    let success = false;
    let response = '';

    try {
      console.log('🧠 Yeti AI processing request...');
      
      // Use the intelligent router for model selection
      response = await aiRouter.routeRequest(enhancedMessage, connectedPlatforms);
      selectedProvider = 'Yeti-Router';
      success = true;
      
      console.log('✅ Yeti AI response generated successfully');
      
      // Add assistant response to memory
      memoryService.addToMemory('assistant', response);
      
      // Save conversation to database if user is available
      if (userId) {
        await memoryService.saveConversation(userId);
      }
      
    } catch (error) {
      console.error('❌ Yeti AI processing failed:', error);
      
      // Track the error
      advancedAnalytics.trackError(
        error instanceof Error ? error : new Error('Unknown AI error'),
        'ai_generation',
        { userMessage: userMessage.substring(0, 100), selectedProvider }
      );

      // Fallback to traditional provider method if router fails
      try {
        response = await this.fallbackGeneration(enhancedMessage, connectedPlatforms);
        selectedProvider = 'Fallback';
        success = true;
      } catch (fallbackError) {
        success = false;
        response = "🧊 All Yeti AI engines are currently unavailable. Please try again later.";
      }
    } finally {
      const duration = Date.now() - startTime;
      
      // Track the AI request
      advancedAnalytics.trackAIRequest(
        selectedProvider,
        userMessage,
        response,
        duration,
        success
      );

      // Track user action
      if (userId) {
        advancedAnalytics.trackUserAction('ai_request', {
          provider: selectedProvider,
          messageLength: userMessage.length,
          responseLength: response.length
        });
      }
    }

    return response;
  }

  private async fallbackGeneration(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return "🧊 Yeti AI is currently offline. Please configure your API settings to enable AI responses.";
    }

    for (const provider of availableProviders) {
      try {
        console.log(`🔄 Yeti falling back to ${provider.name}...`);
        const response = await provider.generateResponse(userMessage, connectedPlatforms);
        console.log(`✅ Fallback successful with ${provider.name}`);
        return response;
      } catch (error) {
        console.error(`❌ ${provider.name} fallback failed:`, error);
        continue;
      }
    }

    return "🧊 All Yeti AI engines are currently unavailable. Please try again later.";
  }

  startNewSession(): void {
    memoryService.startNewSession();
    
    // Track session start
    advancedAnalytics.trackUserAction('new_session', {
      timestamp: new Date().toISOString()
    });
  }

  async loadConversationHistory(userId: string): Promise<any[]> {
    return await memoryService.loadRecentConversations(userId);
  }

  getProviderStatus(): { [key: string]: boolean } {
    const status = this.providers.reduce((status, provider) => {
      status[provider.name] = provider.isAvailable();
      return status;
    }, {} as { [key: string]: boolean });

    // Add router status
    status['Yeti AI Router'] = aiRouter.getAvailableProviders().length > 0;
    
    return status;
  }

  // Enhanced capabilities with new models
  async getResearchResponse(query: string): Promise<string> {
    if (perplexityService.isAvailable()) {
      return await perplexityService.generateResponse(query, []);
    }
    throw new Error('Research service unavailable');
  }

  async getReasoningResponse(query: string): Promise<string> {
    if (claudeService.isAvailable()) {
      return await claudeService.generateResponse(query, []);
    }
    throw new Error('Reasoning service unavailable');
  }

  async getLocalResponse(query: string): Promise<string> {
    if (ollamaService.isAvailable()) {
      return await ollamaService.generateResponse(query, []);
    }
    throw new Error('Local service unavailable');
  }

  // Helper methods for specific AI capabilities
  async detectLanguage(text: string): Promise<string | null> {
    if (sarvam

Service.isAvailable()) {
      return sarvamService.detectLanguage(text);
    }
    return null;
  }

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (sarvamService.isAvailable()) {
      return await sarvamService.translateText(text, sourceLang, targetLang);
    }
    throw new Error('Translation service unavailable');
  }

  async generateImage(prompt: string): Promise<string> {
    if (geminiService.isAvailable()) {
      return await geminiService.generateImage(prompt);
    }
    throw new Error('Image generation service unavailable');
  }

  // Analytics integration
  getAnalytics() {
    return {
      realtimeMetrics: advancedAnalytics.getRealtimeMetrics(),
      modelMetrics: advancedAnalytics.getModelPerformanceMetrics(),
      platformMetrics: advancedAnalytics.getPlatformUsageMetrics(),
      securityMetrics: securityMonitor.getSecurityMetrics()
    };
  }
}

// Create and export singleton instance
export const aiService = new AIService();
