import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMemoryRequest {
  action: 'create_session' | 'get_sessions' | 'get_session' | 'save_message' | 'get_messages' | 'delete_session' | 'update_session_title';
  session_id?: string;
  model_used?: string;
  title?: string;
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  metadata?: any;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ChatMemoryRequest = await req.json();
    let result;

    switch (body.action) {
      case 'create_session':
        result = await createSession(supabaseClient, user.id, body.model_used || 'yeti-core-alpha');
        break;
      
      case 'get_sessions':
        result = await getSessions(supabaseClient, user.id, body.limit || 50);
        break;
      
      case 'get_session':
        if (!body.session_id) throw new Error('Session ID required');
        result = await getSession(supabaseClient, user.id, body.session_id);
        break;
      
      case 'save_message':
        if (!body.session_id || !body.role || !body.content) {
          throw new Error('Session ID, role, and content required');
        }
        result = await saveMessage(supabaseClient, user.id, body.session_id, body.role, body.content, body.metadata);
        break;
      
      case 'get_messages':
        if (!body.session_id) throw new Error('Session ID required');
        result = await getMessages(supabaseClient, user.id, body.session_id);
        break;
      
      case 'delete_session':
        if (!body.session_id) throw new Error('Session ID required');
        result = await deleteSession(supabaseClient, user.id, body.session_id);
        break;
      
      case 'update_session_title':
        if (!body.session_id) throw new Error('Session ID required');
        result = await updateSessionTitle(supabaseClient, user.id, body.session_id, body.title);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yeti-chat-memory:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSession(supabaseClient: any, userId: string, modelUsed: string) {
  const { data, error } = await supabaseClient
    .from('chat_sessions')
    .insert({
      user_id: userId,
      model_used: modelUsed,
      title: 'New Chat Session'
    })
    .select()
    .single();

  if (error) throw error;
  
  return { session: data };
}

async function getSessions(supabaseClient: any, userId: string, limit: number) {
  const { data, error } = await supabaseClient
    .from('chat_sessions')
    .select(`
      id,
      title,
      model_used,
      created_at,
      updated_at,
      is_active,
      chat_messages!inner(
        content,
        role,
        created_at
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Process sessions to include message preview and count
  const sessions = data.map((session: any) => {
    const messages = session.chat_messages || [];
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === 'user')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      id: session.id,
      title: session.title,
      model_used: session.model_used,
      created_at: session.created_at,
      updated_at: session.updated_at,
      message_count: messages.length,
      preview: lastUserMessage?.content?.substring(0, 100) || 'No messages yet',
      is_active: session.is_active
    };
  });

  return { sessions };
}

async function getSession(supabaseClient: any, userId: string, sessionId: string) {
  const { data, error } = await supabaseClient
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  
  return { session: data };
}

async function saveMessage(supabaseClient: any, userId: string, sessionId: string, role: string, content: string, metadata?: any) {
  // First check if the session belongs to the user
  const { data: session, error: sessionError } = await supabaseClient
    .from('chat_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or access denied');
  }

  const { data, error } = await supabaseClient
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      message_metadata: metadata || {}
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-generate session title if this is the first user message
  if (role === 'user') {
    const { data: messageCount } = await supabaseClient
      .from('chat_messages')
      .select('id', { count: 'exact' })
      .eq('session_id', sessionId)
      .eq('role', 'user');

    if (messageCount?.length === 1) {
      // This is the first user message, generate a title
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
      
      await supabaseClient
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId)
        .eq('user_id', userId);
    }
  }

  return { message: data };
}

async function getMessages(supabaseClient: any, userId: string, sessionId: string) {
  // First check if the session belongs to the user
  const { data: session, error: sessionError } = await supabaseClient
    .from('chat_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or access denied');
  }

  const { data, error } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  return { messages: data };
}

async function deleteSession(supabaseClient: any, userId: string, sessionId: string) {
  const { error } = await supabaseClient
    .from('chat_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('id', sessionId);

  if (error) throw error;
  
  return { success: true };
}

async function updateSessionTitle(supabaseClient: any, userId: string, sessionId: string, title?: string) {
  let newTitle = title;
  
  if (!newTitle) {
    // Auto-generate title from first user message
    const { data: firstMessage } = await supabaseClient
      .from('chat_messages')
      .select('content')
      .eq('session_id', sessionId)
      .eq('role', 'user')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (firstMessage) {
      newTitle = firstMessage.content.length > 50 
        ? firstMessage.content.substring(0, 47) + '...' 
        : firstMessage.content;
    } else {
      newTitle = 'New Chat Session';
    }
  }

  const { error } = await supabaseClient
    .from('chat_sessions')
    .update({ title: newTitle })
    .eq('user_id', userId)
    .eq('id', sessionId);

  if (error) throw error;
  
  return { title: newTitle, success: true };
}