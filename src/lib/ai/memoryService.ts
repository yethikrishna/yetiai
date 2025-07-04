
import { supabase } from '@/integrations/supabase/client';
import { userProfileService } from './userProfile';

export interface ConversationMemory {
  id: string;
  user_id: string;
  session_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export class MemoryService {
  private static instance: MemoryService;
  private currentSessionId: string;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> = [];

  constructor() {
    this.currentSessionId = this.generateSessionId();
  }

  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  startNewSession(): void {
    this.currentSessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  addToMemory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Keep only the last 20 messages to prevent memory overflow
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  getRecentHistory(limit: number = 10): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversationHistory
      .slice(-limit)
      .map(({ role, content }) => ({ role, content }));
  }

  async saveConversation(userId: string): Promise<void> {
    if (!userId || this.conversationHistory.length === 0) return;

    try {
      // Since conversation_memory table doesn't exist yet, just log
      console.log('Conversation would be saved for user:', userId);
      console.log('Messages count:', this.conversationHistory.length);
      
      // Extract topics for later when we implement the table
      await this.extractAndSaveTopics(userId);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  private async extractAndSaveTopics(userId: string): Promise<void> {
    try {
      // Simple topic extraction from user messages
      const userMessages = this.conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content.toLowerCase());

      const topics = new Set<string>();
      const topicPatterns = {
        'coding': ['code', 'programming', 'javascript', 'react', 'html', 'css', 'python', 'typescript'],
        'design': ['design', 'ui', 'ux', 'interface', 'layout', 'styling'],
        'business': ['business', 'startup', 'marketing', 'strategy', 'planning'],
        'education': ['learn', 'study', 'tutorial', 'explain', 'understand'],
        'productivity': ['task', 'organize', 'schedule', 'workflow', 'automation'],
        'technology': ['tech', 'ai', 'api', 'database', 'server', 'cloud'],
        'creative': ['creative', 'writing', 'content', 'art', 'music'],
        'social': ['social', 'media', 'facebook', 'twitter', 'instagram', 'linkedin']
      };

      for (const message of userMessages) {
        for (const [topic, keywords] of Object.entries(topicPatterns)) {
          if (keywords.some(keyword => message.includes(keyword))) {
            topics.add(topic);
          }
        }
      }

      // Save topics to user profile
      for (const topic of topics) {
        await userProfileService.addFavoriteTopic(userId, topic);
      }
    } catch (error) {
      console.error('Error extracting topics:', error);
    }
  }

  async loadRecentConversations(userId: string, limit: number = 3): Promise<ConversationMemory[]> {
    if (!userId) return [];

    try {
      // Since conversation_memory table doesn't exist yet, return empty array
      console.log('Would load conversations for user:', userId);
      return [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  private generateConversationSummary(): string {
    const userMessages = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .slice(-5);
    
    return `Recent topics: ${userMessages.join('; ').substring(0, 200)}...`;
  }

  async buildContextPrompt(userId?: string): Promise<string> {
    let contextPrompt = '';

    // Add user profile context
    if (userId) {
      const profile = await userProfileService.getOrCreateProfile(userId);
      contextPrompt += userProfileService.buildProfileContext(profile);
    }

    // Add conversation history
    if (this.conversationHistory.length > 0) {
      const recentMessages = this.getRecentHistory(8);
      contextPrompt += '\n\n=== CONVERSATION HISTORY ===\n';
      
      recentMessages.forEach(msg => {
        contextPrompt += `${msg.role === 'user' ? 'Human' : 'Yeti'}: ${msg.content}\n`;
      });

      contextPrompt += '=== END HISTORY ===\n\n';
    }

    // Add previous conversations context
    if (userId) {
      const recentConversations = await this.loadRecentConversations(userId, 2);
      if (recentConversations.length > 0) {
        contextPrompt += '=== PREVIOUS CONVERSATIONS ===\n';
        recentConversations.forEach((conv, index) => {
          if (conv.summary) {
            contextPrompt += `Session ${index + 1}: ${conv.summary}\n`;
          }
        });
        contextPrompt += '=== END PREVIOUS CONVERSATIONS ===\n\n';
      }
    }

    if (contextPrompt) {
      contextPrompt += 'Please continue the conversation naturally, referencing previous topics when relevant. ';
      contextPrompt += 'Use the user context to personalize your responses and remember their preferences. ';
      contextPrompt += 'You can reference earlier conversations or topics we\'ve discussed.';
    }

    return contextPrompt;
  }
}

export const memoryService = MemoryService.getInstance();
