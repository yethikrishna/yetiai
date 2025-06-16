
import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { MessageList } from './chat/MessageList';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useMcpServer } from '@/hooks/useMcpServer';
import { aiService } from '@/lib/ai/aiService';
import { Message } from '@/hooks/useChat';

interface YetiChatWindowProps {
  onToggleSidebar: () => void;
}

export function YetiChatWindow({ onToggleSidebar }: YetiChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'yeti',
      message: "🧊 Hey there! I'm Yeti, your AI assistant. I can help you with questions and automate tasks across your connected platforms. What would you like to do today?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectedPlatforms } = usePlatforms();
  const { executePlatformAction, isExecuting } = useMcpServer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      message: inputMessage,
      time: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsBotThinking(true);

    try {
      // Check if the message is asking for a platform action
      const platformAction = await detectPlatformAction(inputMessage);
      
      if (platformAction) {
        // Execute platform action using MCP server
        const response = await executePlatformAction(
          platformAction.platform,
          platformAction.action,
          platformAction.parameters
        );
        
        let botResponse = '';
        if (response.success) {
          botResponse = `🧊 Great! I've successfully executed "${platformAction.action}" on ${platformAction.platform}. Here's what happened:\n\n${JSON.stringify(response.data, null, 2)}`;
        } else {
          botResponse = `🧊 I encountered an issue while executing "${platformAction.action}" on ${platformAction.platform}: ${response.error}`;
        }
        
        setMessages(prev => [...prev, {
          sender: 'yeti',
          message: botResponse,
          time: new Date().toLocaleTimeString(),
        }]);
      } else {
        // Regular AI chat response using the new AI service
        const response = await aiService.generateResponse(inputMessage, connectedPlatforms);
        
        setMessages(prev => [...prev, {
          sender: 'yeti',
          message: response,
          time: new Date().toLocaleTimeString(),
        }]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        sender: 'yeti',
        message: "🧊 I'm having trouble processing your request right now. Please try again!",
        time: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const detectPlatformAction = async (message: string): Promise<{
    platform: string;
    action: string;
    parameters: Record<string, any>;
  } | null> => {
    // Use AI to detect if the message is requesting a platform action
    const prompt = `Analyze this user message and determine if they're asking for a specific platform action. If yes, extract the platform, action, and parameters.

User message: "${message}"

Connected platforms: ${connectedPlatforms.map(p => p.name).join(', ')}

If this is a platform action request, respond with JSON in this format:
{
  "isPlatformAction": true,
  "platform": "platform_id",
  "action": "action_name",
  "parameters": {...}
}

If this is just a regular question, respond with:
{
  "isPlatformAction": false
}

Examples of platform actions:
- "Create a GitHub repository called 'my-project'" -> {"isPlatformAction": true, "platform": "github", "action": "create_repository", "parameters": {"name": "my-project"}}
- "Send an email to john@example.com" -> {"isPlatformAction": true, "platform": "gmail", "action": "send_email", "parameters": {"to": "john@example.com"}}
- "What's the weather today?" -> {"isPlatformAction": false}`;

    try {
      const response = await aiService.generateResponse(prompt, []);
      const parsed = JSON.parse(response);
      
      if (parsed.isPlatformAction) {
        return {
          platform: parsed.platform,
          action: parsed.action,
          parameters: parsed.parameters
        };
      }
    } catch (error) {
      console.log('Could not parse platform action:', error);
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader connectedPlatforms={connectedPlatforms} onToggleSidebar={onToggleSidebar} />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList messages={messages} isBotThinking={isBotThinking} />
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        input={inputMessage}
        setInput={setInputMessage}
        handleSend={handleSendMessage}
        isBotThinking={isBotThinking || isExecuting}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}
