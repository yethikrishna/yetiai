
import { ConnectionConfig } from '@/types/platform';

interface ClaudeModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1KTokens: number;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  temperature?: number;
  messages: ClaudeMessage[];
  stream?: boolean;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class AnthropicHandler {
  private baseUrl = 'https://api.anthropic.com/v1';
  private version = '2023-06-01';

  // Available Claude models
  public readonly models: ClaudeModel[] = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      description: 'Most powerful model for complex tasks',
      maxTokens: 4096,
      costPer1KTokens: 15.00
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      description: 'Balanced performance and speed',
      maxTokens: 4096,
      costPer1KTokens: 3.00
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      description: 'Fastest and most cost-effective',
      maxTokens: 4096,
      costPer1KTokens: 0.25
    }
  ];

  async connect(credentials: Record<string, string>): Promise<boolean> {
    const { apiKey } = credentials;
    
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Test the connection by making a simple API call
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': this.version,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Invalid API key or connection failed');
      }

      console.log('Anthropic Claude connection successful');
      return true;
    } catch (error) {
      console.error('Anthropic Claude connection failed:', error);
      throw new Error('Failed to connect to Anthropic Claude. Please check your API key.');
    }
  }

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Anthropic Claude disconnected');
  }

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': connection.credentials.apiKey,
          'anthropic-version': this.version,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 5,
          messages: [
            {
              role: 'user',
              content: 'Test'
            }
          ]
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Anthropic Claude test failed:', error);
      return false;
    }
  }

  // Generate text with Claude
  async generateText(
    apiKey: string,
    model: string,
    prompt: string,
    parameters: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt
    } = parameters;

    try {
      const messages: ClaudeMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const requestBody: any = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': this.version,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Claude API error: ${response.statusText}`);
      }

      const result: ClaudeResponse = await response.json();
      return result.content[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Claude text generation failed:', error);
      throw error;
    }
  }

  // Chat with conversation history
  async chat(
    apiKey: string,
    model: string,
    messages: ClaudeMessage[],
    parameters: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt
    } = parameters;

    try {
      const requestBody: any = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages
      };

      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': this.version,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Claude API error: ${response.statusText}`);
      }

      const result: ClaudeResponse = await response.json();
      return result.content[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Claude chat failed:', error);
      throw error;
    }
  }

  // Analyze text
  async analyzeText(
    apiKey: string,
    model: string,
    text: string,
    analysisType: 'sentiment' | 'summary' | 'keywords' | 'custom',
    customPrompt?: string
  ): Promise<string> {
    const prompts = {
      sentiment: `Analyze the sentiment of the following text and provide a brief explanation:\n\n${text}`,
      summary: `Provide a concise summary of the following text:\n\n${text}`,
      keywords: `Extract the main keywords and key phrases from the following text:\n\n${text}`,
      custom: customPrompt || `Analyze the following text:\n\n${text}`
    };

    return await this.generateText(apiKey, model, prompts[analysisType], {
      maxTokens: 500,
      temperature: 0.3
    });
  }

  // Get model information
  getModelInfo(modelId: string): ClaudeModel | undefined {
    return this.models.find(model => model.id === modelId);
  }

  // Get all available models
  getAvailableModels(): ClaudeModel[] {
    return this.models;
  }
}

export const anthropicHandler = new AnthropicHandler();
