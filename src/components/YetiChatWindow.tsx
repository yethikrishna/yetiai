
import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { MessageList } from './chat/MessageList';
import { usePlatforms } from '@/hooks/usePlatforms';
import { aiService } from '@/lib/ai/aiService';
import { Message } from '@/hooks/useChat';
import { useUser } from '@clerk/clerk-react';

interface YetiChatWindowProps {
  onToggleSidebar: () => void;
}

export function YetiChatWindow({ onToggleSidebar }: YetiChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'yeti',
      message: "🧊 Hey there! I'm Yeti, your AI assistant with memory. I can help you with general questions, provide information on any topic, assist with coding, and automate tasks across your connected platforms. What would you like to know or do today?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectedPlatforms } = usePlatforms();
  const { user } = useUser();

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
      // Use AI service to generate response for all types of questions
      const response = await aiService.generateResponse(
        inputMessage, 
        connectedPlatforms, 
        user?.id
      );
      
      setMessages(prev => [...prev, {
        sender: 'yeti',
        message: response,
        time: new Date().toLocaleTimeString(),
      }]);
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

  const handleNewSession = () => {
    aiService.startNewSession();
    setMessages([{
      sender: 'yeti',
      message: "🧊 Starting a fresh conversation! I'm ready to help you with questions, coding, platform automation, or anything else. What would you like to do?",
      time: new Date().toLocaleTimeString(),
    }]);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader 
        connectedPlatforms={connectedPlatforms} 
        onToggleSidebar={onToggleSidebar}
        onNewSession={handleNewSession}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList messages={messages} isBotThinking={isBotThinking} />
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        input={inputMessage}
        setInput={setInputMessage}
        handleSend={handleSendMessage}
        isBotThinking={isBotThinking}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}
