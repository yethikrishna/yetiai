import { ConnectionConfig } from "@/types/platform";

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIHandler {
  private baseUrl = 'https://api.openai.com/v1';

  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('🤖 Connecting to OpenAI...');
    
    if (!credentials.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    if (!credentials.apiKey.startsWith('sk-')) {
      throw new Error("Invalid API key format. OpenAI API keys start with 'sk-'");
    }
    
    // Test the API key by making a simple request
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ OpenAI connection successful');
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || 'Invalid OpenAI API key');
      }
    } catch (error) {
      console.error('❌ OpenAI connection failed:', error);
      throw error;
    }
  }

  async test(config: ConnectionConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI test failed:', error);
      return false;
    }
  }

  async disconnect(config: ConnectionConfig): Promise<boolean> {
    console.log("Disconnecting from OpenAI...");
    return true;
  }

  // Enhanced AI automation methods for Yeti Agent
  async generateContent(parameters: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    type?: 'social' | 'blog' | 'email' | 'code' | 'general';
    platform?: string;
    tone?: 'professional' | 'casual' | 'friendly' | 'excited' | 'empathetic';
  }, apiKey: string): Promise<any> {
    console.log('🤖 Generating content with OpenAI:', parameters.type || 'general');
    
    let systemPrompt = 'You are Yeti AI, a helpful assistant that creates high-quality content.';
    
    // Customize system prompt based on content type
    switch (parameters.type) {
      case 'social':
        systemPrompt = `You are Yeti AI, a social media expert. Create engaging, shareable content that drives engagement. ${parameters.platform ? `Optimize for ${parameters.platform}` : 'Use platform-appropriate formatting.'} Keep it concise and impactful.`;
        break;
      case 'blog':
        systemPrompt = 'You are Yeti AI, a skilled content writer. Create well-structured, informative blog content with clear headings, engaging introductions, and valuable insights.';
        break;
      case 'email':
        systemPrompt = `You are Yeti AI, a professional communication expert. Write clear, ${parameters.tone || 'professional'} emails that achieve their purpose while maintaining appropriate tone.`;
        break;
      case 'code':
        systemPrompt = 'You are Yeti AI, a senior software engineer. Write clean, well-documented, production-ready code with proper error handling and best practices.';
        break;
    }

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: parameters.prompt }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: parameters.maxTokens || 500,
        temperature: parameters.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const result: OpenAIResponse = await response.json();
    return {
      content: result.choices[0]?.message?.content || '',
      usage: result.usage,
      type: parameters.type,
      platform: parameters.platform
    };
  }

  async generateImage(parameters: {
    prompt: string;
    size?: '256x256' | '512x512' | '1024x1024';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  }, apiKey: string): Promise<any> {
    console.log('🎨 Generating image with DALL-E:', parameters.prompt);

    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: parameters.prompt,
        size: parameters.size || '1024x1024',
        quality: parameters.quality || 'standard',
        style: parameters.style || 'vivid',
        n: 1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DALL-E API request failed');
    }

    const result = await response.json();
    return {
      url: result.data[0]?.url || '',
      prompt: parameters.prompt,
      revised_prompt: result.data[0]?.revised_prompt || ''
    };
  }

  async analyzeSentiment(parameters: { text: string }, apiKey: string): Promise<any> {
    console.log('🔍 Analyzing sentiment with OpenAI');

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with a JSON object containing: {"score": number between -1 and 1, "tone": "positive/negative/neutral", "confidence": number between 0 and 1, "emotions": ["emotion1", "emotion2"], "summary": "brief explanation"}'
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this text: "${parameters.text}"`
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI sentiment analysis failed');
    }

    const result: OpenAIResponse = await response.json();
    const content = result.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch (error) {
      // Fallback parsing
      return {
        score: 0,
        tone: 'neutral',
        confidence: 0.5,
        emotions: ['neutral'],
        summary: 'Could not parse sentiment analysis'
      };
    }
  }

  async generateResponse(parameters: {
    context: string;
    tone?: string;
    platform?: string;
    responseType?: 'reply' | 'dm' | 'comment' | 'email';
  }, apiKey: string): Promise<any> {
    console.log('💬 Generating response with OpenAI');

    let systemPrompt = `You are Yeti AI, a helpful customer service assistant. Generate appropriate responses that are helpful, empathetic, and professional.`;
    
    if (parameters.platform) {
      systemPrompt += ` This is for ${parameters.platform}, so format appropriately for that platform.`;
    }
    
    if (parameters.tone) {
      systemPrompt += ` Use a ${parameters.tone} tone.`;
    }

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate a ${parameters.responseType || 'reply'} to this message: "${parameters.context}"`
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI response generation failed');
    }

    const result: OpenAIResponse = await response.json();
    return {
      text: result.choices[0]?.message?.content || '',
      context: parameters.context,
      platform: parameters.platform,
      tone: parameters.tone
    };
  }

  async summarizeContent(parameters: {
    articles: Array<{ title: string; content: string; url?: string }>;
    maxWords?: number;
    format?: 'bullets' | 'paragraph' | 'thread';
  }, apiKey: string): Promise<any> {
    console.log('📄 Summarizing content with OpenAI');

    const articlesText = parameters.articles.map(article => 
      `Title: ${article.title}\nContent: ${article.content}`
    ).join('\n\n---\n\n');

    const formatInstructions = {
      bullets: 'Format as bullet points with key highlights',
      paragraph: 'Write as a cohesive paragraph summary',
      thread: 'Create a Twitter thread with multiple connected tweets (number each tweet)'
    };

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are Yeti AI, a content summarization expert. ${formatInstructions[parameters.format || 'paragraph']}. Keep the summary under ${parameters.maxWords || 100} words.`
      },
      {
        role: 'user',
        content: `Summarize these articles:\n\n${articlesText}`
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 600,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI summarization failed');
    }

    const result: OpenAIResponse = await response.json();
    const content = result.choices[0]?.message?.content || '';

    // Parse thread format if requested
    if (parameters.format === 'thread') {
      const tweets = content.split(/\d+[\.\)]\s*/).filter(tweet => tweet.trim().length > 0);
      return {
        thread: tweets,
        professional_summary: content,
        originalArticles: parameters.articles.length
      };
    }

    return {
      summary: content,
      professional_summary: content,
      format: parameters.format,
      originalArticles: parameters.articles.length
    };
  }

  async generateCode(parameters: {
    description: string;
    language: string;
    framework?: string;
    includeComments?: boolean;
    includeTests?: boolean;
  }, apiKey: string): Promise<any> {
    console.log('💻 Generating code with OpenAI');

    let systemPrompt = `You are Yeti AI, a senior software engineer. Generate clean, production-ready ${parameters.language} code`;
    
    if (parameters.framework) {
      systemPrompt += ` using ${parameters.framework}`;
    }
    
    if (parameters.includeComments) {
      systemPrompt += `. Include detailed comments explaining the code.`;
    }
    
    systemPrompt += ` Follow best practices and include proper error handling.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: parameters.description }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI code generation failed');
    }

    const result: OpenAIResponse = await response.json();
    return {
      code: result.choices[0]?.message?.content || '',
      language: parameters.language,
      framework: parameters.framework,
      description: parameters.description
    };
  }

  // Workflow integration methods
  async executeCommand(command: string, parameters: any, apiKey: string): Promise<any> {
    switch (command) {
      case 'generateContent':
        return await this.generateContent(parameters, apiKey);
      case 'generateImage':
        return await this.generateImage(parameters, apiKey);
      case 'analyzeSentiment':
        return await this.analyzeSentiment(parameters, apiKey);
      case 'generateResponse':
        return await this.generateResponse(parameters, apiKey);
      case 'summarizeContent':
        return await this.summarizeContent(parameters, apiKey);
      case 'generateCode':
        return await this.generateCode(parameters, apiKey);
      default:
        throw new Error(`Unknown OpenAI command: ${command}`);
    }
  }
}

export const openaiHandler = new OpenAIHandler();