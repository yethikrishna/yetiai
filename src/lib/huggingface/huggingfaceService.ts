
import { huggingfaceHandler } from '@/handlers/huggingfaceHandler';
import { Platform } from '@/types/platform';

export class HuggingFaceService {
  private getApiKey(connectedPlatforms: Platform[]): string | null {
    const hfPlatform = connectedPlatforms.find(p => p.id === 'huggingface');
    if (!hfPlatform) return null;
    
    // In a real app, you'd get this from secure storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === 'huggingface');
    return connection?.credentials?.apiKey || null;
  }

  async searchModels(
    connectedPlatforms: Platform[], 
    task?: string, 
    query?: string
  ): Promise<any[]> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Hugging Face not connected');
    }

    return await huggingfaceHandler.searchModels(apiKey, {
      task,
      search: query,
      limit: 10,
    });
  }

  async generateText(
    connectedPlatforms: Platform[],
    model: string,
    prompt: string,
    parameters?: Record<string, any>
  ): Promise<string> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Hugging Face not connected');
    }

    return await huggingfaceHandler.generateText(apiKey, model, prompt, parameters);
  }

  async classifyText(
    connectedPlatforms: Platform[],
    model: string,
    text: string
  ): Promise<any> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Hugging Face not connected');
    }

    return await huggingfaceHandler.classifyText(apiKey, model, text);
  }

  async summarizeText(
    connectedPlatforms: Platform[],
    model: string,
    text: string,
    parameters?: Record<string, any>
  ): Promise<string> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Hugging Face not connected');
    }

    return await huggingfaceHandler.summarizeText(apiKey, model, text, parameters);
  }

  async getPopularModels(connectedPlatforms: Platform[], task: string): Promise<any[]> {
    const apiKey = this.getApiKey(connectedPlatforms);
    if (!apiKey) {
      throw new Error('Hugging Face not connected');
    }

    return await huggingfaceHandler.getPopularModelsByTask(apiKey, task);
  }
}

export const huggingfaceService = new HuggingFaceService();
