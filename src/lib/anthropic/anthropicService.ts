
import { anthropicHandler } from '@/handlers/anthropicHandler';
import { Platform } from '@/types/platform';

export class AnthropicService {
  private getApiKey(connectedPlatforms: Platform[]): string | null {
    const anthropicPlatform = connectedPlatforms.find(p => p.id === 'anthropic');
    if (!anthropicPlatform) return null;
    
    // In a real app, you'd get this from secure storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === 'anthropic');
    return connection?.credentials?.apiKey || null;
  }

  async generateText(
    connectedPlatforms: Platform[],
    model: string,
    prompt: string,
    parameters?: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Anthropic Claude not connected');
    }

    return await anthropicHandler.generateText(apiKey, model, prompt, parameters);
  }

  async chat(
    connectedPlatforms: Platform[],
    model: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    parameters?: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Anthropic Claude not connected');
    }

    return await anthropicHandler.chat(apiKey, model, messages, parameters);
  }

  async analyzeText(
    connectedPlatforms: Platform[],
    model: string,
    text: string,
    analysisType: 'sentiment' | 'summary' | 'keywords' | 'custom',
    customPrompt?: string
  ): Promise<string> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Anthropic Claude not connected');
    }

    return await anthropicHandler.analyzeText(apiKey, model, text, analysisType, customPrompt);
  }

  getAvailableModels(): Array<{
    id: string;
    name: string;
    description: string;
    maxTokens: number;
    costPer1KTokens: number;
  }> {
    return anthropicHandler.getAvailableModels();
  }

  getModelInfo(modelId: string) {
    return anthropicHandler.getModelInfo(modelId);
  }

  // Helper method to get the best model for a task
  getRecommendedModel(task: 'complex' | 'balanced' | 'fast'): string {
    const modelMap = {
      complex: 'claude-3-opus-20240229',
      balanced: 'claude-3-sonnet-20240229',
      fast: 'claude-3-haiku-20240307'
    };
    return modelMap[task];
  }
}

export const anthropicService = new AnthropicService();
