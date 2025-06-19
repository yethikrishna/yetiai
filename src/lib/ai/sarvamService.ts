
import { AIProvider } from './types';
import { Platform } from '@/types/platform';

interface SarvamResponse {
  transcript?: string;
  translated_text?: string;
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

class SarvamService implements AIProvider {
  public name = 'Yeti-Local';
  private apiKey: string | null = null;
  private baseUrl = 'https://api.sarvam.ai';

  // Language detection patterns
  private indicLanguagePatterns = {
    'hi-IN': /[\u0900-\u097F]/,  // Devanagari (Hindi)
    'bn-IN': /[\u0980-\u09FF]/,  // Bengali
    'kn-IN': /[\u0C80-\u0CFF]/,  // Kannada
    'ml-IN': /[\u0D00-\u0D7F]/,  // Malayalam
    'mr-IN': /[\u0900-\u097F]/,  // Marathi (also Devanagari)
    'ta-IN': /[\u0B80-\u0BFF]/,  // Tamil
    'te-IN': /[\u0C00-\u0C7F]/,  // Telugu
    'gu-IN': /[\u0A80-\u0AFF]/,  // Gujarati
    'pa-IN': /[\u0A00-\u0A7F]/,  // Punjabi
    'od-IN': /[\u0B00-\u0B7F]/   // Odia
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKeyFromEnv();
  }

  private getApiKeyFromEnv(): string | null {
    return process.env.REACT_APP_YETI_LOCAL_KEY || 
           process.env.SARVAM_API_KEY || 
           localStorage.getItem('yeti-local-key') || 
           null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('yeti-local-key', apiKey);
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  detectLanguage(text: string): string | null {
    for (const [langCode, pattern] of Object.entries(this.indicLanguagePatterns)) {
      if (pattern.test(text)) {
        return langCode;
      }
    }
    return null;
  }

  hasIndicContent(text: string): boolean {
    return this.detectLanguage(text) !== null;
  }

  private async makeRequest(endpoint: string, payload: any, headers: any = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Yeti Local service unavailable');
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Yeti Local API Error:', error);
      throw new Error(`Yeti Local processing failed: ${response.status}`);
    }

    return response.json();
  }

  async generateResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    try {
      // Check if the message contains Indic languages
      const detectedLanguage = this.detectLanguage(userMessage);
      
      if (detectedLanguage) {
        // If Indic language detected, use Sarvam's chat completion
        return await this.generateIndicResponse(userMessage, connectedPlatforms);
      } else {
        // For English queries about Indian content, also use Sarvam
        const isIndianContext = this.hasIndianContext(userMessage);
        if (isIndianContext) {
          return await this.generateIndicResponse(userMessage, connectedPlatforms);
        }
      }

      // Fallback to indicate this service isn't suitable
      throw new Error('Not suitable for Yeti Local processing');

    } catch (error) {
      console.error('Yeti Local generation error:', error);
      throw error;
    }
  }

  private hasIndianContext(text: string): boolean {
    const indianKeywords = [
      'india', 'indian', 'hindi', 'bengali', 'tamil', 'telugu', 'kannada', 
      'malayalam', 'marathi', 'gujarati', 'punjabi', 'sanskrit', 'bollywood',
      'ayurveda', 'yoga', 'cricket', 'rupee', 'delhi', 'mumbai', 'bangalore',
      'chennai', 'kolkata', 'hyderabad', 'pune', 'gandhi', 'nehru'
    ];
    
    const lowerText = text.toLowerCase();
    return indianKeywords.some(keyword => lowerText.includes(keyword));
  }

  private async generateIndicResponse(userMessage: string, connectedPlatforms: Platform[]): Promise<string> {
    const payload = {
      model: "sarvam-m",
      messages: [
        {
          role: "system",
          content: "You are Yeti AI, a helpful assistant that can communicate in multiple Indian languages and has deep knowledge of Indian culture, traditions, and contexts. Respond naturally in the same language as the user's query, or in English if the query is in English but about Indian topics."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    };

    const response = await this.makeRequest('chat/completions', payload);
    
    return response.choices?.[0]?.message?.content || 
           'Yeti processed your request successfully.';
  }

  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string,
    mode: 'formal' | 'code-mixed' = 'formal'
  ): Promise<string> {
    try {
      const payload = {
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        speaker_gender: "Female",
        mode: mode,
        model: "mayura:v1",
        enable_preprocessing: true
      };

      const response = await this.makeRequest('translate', payload);
      return response.translated_text || text;

    } catch (error) {
      console.error('Yeti translation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioFile: File, languageCode: string = 'hi-IN'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('language_code', languageCode);
      formData.append('model', 'saarika:v2');

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      return result.transcript || '';

    } catch (error) {
      console.error('Yeti transcription error:', error);
      throw error;
    }
  }

  async generateSpeech(
    text: string, 
    languageCode: string = 'hi-IN',
    speaker: string = 'anushka'
  ): Promise<Blob> {
    try {
      const payload = {
        inputs: [text],
        target_language_code: languageCode,
        speaker: speaker,
        pitch: 0,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2"
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Speech generation failed: ${response.status}`);
      }

      return await response.blob();

    } catch (error) {
      console.error('Yeti speech generation error:', error);
      throw error;
    }
  }
}

export const sarvamService = new SarvamService();
