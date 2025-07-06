import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatSession {
  id: string;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  preview: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_metadata?: any;
  created_at: string;
}

export function useYetiChatMemory() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const createSession = useCallback(async (modelUsed: string = 'yeti-core-alpha'): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'create_session',
          model_used: modelUsed
        },
      });

      if (error) {
        console.warn('Memory service unavailable, using local session');
        // Create a local session ID as fallback
        const localSessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSession(localSessionId);
        toast({
          title: "🧊 Local Chat Session",
          description: "Started without memory (authentication required for persistence)",
        });
        return localSessionId;
      }

      const sessionId = data.session.id;
      setCurrentSession(sessionId);
      
      // Refresh sessions list
      await loadSessions();

      toast({
        title: "🧊 New Chat Session",
        description: "Started a new conversation!",
      });

      return sessionId;
    } catch (error) {
      console.warn('Memory service unavailable, using local session:', error);
      // Create a local session ID as fallback
      const localSessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSession(localSessionId);
      toast({
        title: "🧊 Local Chat Session",
        description: "Started without memory (sign in for persistence)",
      });
      return localSessionId;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadSessions = useCallback(async (limit: number = 50) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'get_sessions',
          limit
        },
      });

      if (error) {
        console.warn('Memory service unavailable, skipping session load');
        setSessions([]);
        return;
      }
      setSessions(data.sessions || []);
    } catch (error) {
      console.warn('Memory service unavailable, skipping session load:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'get_messages',
          session_id: sessionId
        },
      });

      if (error) throw error;
      
      setMessages(data.messages || []);
      setCurrentSession(sessionId);

      toast({
        title: "🧠 Session Loaded",
        description: "Chat history restored successfully!",
      });
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "❄️ Load Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveMessage = useCallback(async (
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<boolean> => {
    try {
      // If this is a local session, just add to local state
      if (sessionId.startsWith('local_')) {
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          session_id: sessionId,
          user_id: 'local',
          role,
          content,
          message_metadata: metadata || {},
          created_at: new Date().toISOString()
        };
        
        if (sessionId === currentSession) {
          setMessages(prev => [...prev, newMessage]);
        }
        return true;
      }

      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'save_message',
          session_id: sessionId,
          role,
          content,
          metadata
        },
      });

      if (error) {
        console.warn('Memory service unavailable, storing locally');
        // Fallback to local storage
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          session_id: sessionId,
          user_id: 'local',
          role,
          content,
          message_metadata: metadata || {},
          created_at: new Date().toISOString()
        };
        
        if (sessionId === currentSession) {
          setMessages(prev => [...prev, newMessage]);
        }
        return true;
      }

      // If this is the current session, add the message to local state
      if (sessionId === currentSession) {
        setMessages(prev => [...prev, data.message]);
      }

      // Refresh sessions to update preview and timestamps
      await loadSessions();

      return true;
    } catch (error) {
      console.warn('Error saving message, storing locally:', error);
      // Fallback to local storage
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session_id: sessionId,
        user_id: 'local',
        role,
        content,
        message_metadata: metadata || {},
        created_at: new Date().toISOString()
      };
      
      if (sessionId === currentSession) {
        setMessages(prev => [...prev, newMessage]);
      }
      return true;
    }
  }, [currentSession, loadSessions, toast]);

  const deleteSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'delete_session',
          session_id: sessionId
        },
      });

      if (error) throw error;

      // If this was the current session, clear it
      if (sessionId === currentSession) {
        setCurrentSession(null);
        setMessages([]);
      }

      // Refresh sessions list
      await loadSessions();

      toast({
        title: "🗑️ Session Deleted",
        description: "Chat session has been removed",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "❄️ Delete Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, loadSessions, toast]);

  const updateSessionTitle = useCallback(async (sessionId: string, title?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'update_session_title',
          session_id: sessionId,
          title
        },
      });

      if (error) throw error;

      // Refresh sessions to show updated title
      await loadSessions();

      return data.title;
    } catch (error) {
      console.error('Error updating session title:', error);
      toast({
        title: "❄️ Update Error",
        description: "Failed to update session title",
        variant: "destructive",
      });
      return null;
    }
  }, [loadSessions, toast]);

  const startNewSession = useCallback(async (modelUsed: string = 'yeti-core-alpha') => {
    const sessionId = await createSession(modelUsed);
    if (sessionId) {
      setMessages([]);
      setCurrentSession(sessionId);
    }
    return sessionId;
  }, [createSession]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
  }, []);

  return {
    isLoading,
    sessions,
    currentSession,
    messages,
    createSession,
    loadSessions,
    loadSession,
    saveMessage,
    deleteSession,
    updateSessionTitle,
    startNewSession,
    clearCurrentSession,
    setMessages // For local state updates
  };
}