import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

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
      // Generate a summary for long conversations
      const summary = this.conversationHistory.length > 5 
        ? this.generateConversationSummary() 
        : undefined;

      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: userId,
          session_id: this.currentSessionId,
          messages: this.conversationHistory,
          summary,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async loadRecentConversations(userId: string, limit: number = 3): Promise<ConversationMemory[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error loading conversations:', error);
        return [];
      }

      return data || [];
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

  buildContextPrompt(userId?: string): string {
    if (this.conversationHistory.length === 0) return '';

    const recentMessages = this.getRecentHistory(6);
    let contextPrompt = '\n\nConversation Context:\n';
    
    recentMessages.forEach(msg => {
      contextPrompt += `${msg.role === 'user' ? 'User' : 'Yeti'}: ${msg.content}\n`;
    });

    return contextPrompt;
  }
}

export const memoryService = MemoryService.getInstance();
