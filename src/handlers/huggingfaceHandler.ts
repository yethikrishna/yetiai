
import { ConnectionConfig } from '@/types/platform';

interface HuggingFaceModel {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  task: string;
  tags: string[];
}

interface HuggingFaceSearchParams {
  task?: string;
  author?: string;
  search?: string;
  limit?: number;
}

interface HuggingFaceInferenceParams {
  model: string;
  inputs: string | Record<string, any>;
  parameters?: Record<string, any>;
}

class HuggingFaceHandler {
  private baseUrl = 'https://huggingface.co/api';
  private inferenceUrl = 'https://api-inference.huggingface.co';

  async connect(credentials: Record<string, string>): Promise<boolean> {
    const { apiKey } = credentials;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key is required');
    }

    // Test the connection by making a simple API call
    try {
      const response = await fetch(`${this.baseUrl}/whoami-v2`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key or connection failed');
      }

      console.log('Hugging Face connection successful');
      return true;
    } catch (error) {
      console.error('Hugging Face connection failed:', error);
      throw new Error('Failed to connect to Hugging Face. Please check your API key.');
    }
  }

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Hugging Face disconnected');
  }

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/whoami-v2`, {
        headers: {
          'Authorization': `Bearer ${connection.credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Hugging Face test failed:', error);
      return false;
    }
  }

  // Search functionality
  async searchModels(
    apiKey: string, 
    params: HuggingFaceSearchParams = {}
  ): Promise<HuggingFaceModel[]> {
    const { task, author, search, limit = 10 } = params;
    
    const searchParams = new URLSearchParams();
    if (task) searchParams.append('filter', task);
    if (author) searchParams.append('author', author);
    if (search) searchParams.append('search', search);
    searchParams.append('limit', limit.toString());
    searchParams.append('full', 'true');

    try {
      const response = await fetch(`${this.baseUrl}/models?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const models = await response.json();
      return models.map((model: any) => ({
        id: model.id,
        author: model.id.split('/')[0] || 'unknown',
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        task: model.pipeline_tag || 'unknown',
        tags: model.tags || [],
      }));
    } catch (error) {
      console.error('Model search failed:', error);
      throw error;
    }
  }

  async searchDatasets(
    apiKey: string,
    params: { search?: string; limit?: number } = {}
  ): Promise<any[]> {
    const { search, limit = 10 } = params;
    
    const searchParams = new URLSearchParams();
    if (search) searchParams.append('search', search);
    searchParams.append('limit', limit.toString());

    try {
      const response = await fetch(`${this.baseUrl}/datasets?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Dataset search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Dataset search failed:', error);
      throw error;
    }
  }

  // Execute functionality
  async runInference(
    apiKey: string,
    params: HuggingFaceInferenceParams
  ): Promise<any> {
    const { model, inputs, parameters = {} } = params;

    try {
      const response = await fetch(`${this.inferenceUrl}/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs,
          parameters,
        }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Model is currently loading. Please try again in a few seconds.');
        }
        throw new Error(`Inference failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Inference failed:', error);
      throw error;
    }
  }

  // Specific task methods
  async generateText(
    apiKey: string,
    model: string,
    prompt: string,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    const result = await this.runInference(apiKey, {
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        ...parameters,
      },
    });

    // Handle different response formats
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    }
    if (result.generated_text) {
      return result.generated_text;
    }
    return JSON.stringify(result);
  }

  async classifyText(
    apiKey: string,
    model: string,
    text: string
  ): Promise<any> {
    return await this.runInference(apiKey, {
      model,
      inputs: text,
    });
  }

  async summarizeText(
    apiKey: string,
    model: string,
    text: string,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    const result = await this.runInference(apiKey, {
      model,
      inputs: text,
      parameters: {
        max_length: 150,
        min_length: 50,
        ...parameters,
      },
    });

    if (Array.isArray(result) && result[0]?.summary_text) {
      return result[0].summary_text;
    }
    if (result.summary_text) {
      return result.summary_text;
    }
    return JSON.stringify(result);
  }

  // Get popular models by task
  async getPopularModelsByTask(apiKey: string, task: string): Promise<HuggingFaceModel[]> {
    return await this.searchModels(apiKey, { 
      task, 
      limit: 5 
    });
  }
}

export const huggingfaceHandler = new HuggingFaceHandler();
