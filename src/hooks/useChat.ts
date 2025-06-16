
import { useState, useEffect } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { aiService } from '@/lib/ai/aiService';
import { getNow } from '@/lib/yeti/responses';
import { useUser } from '@clerk/clerk-react';

export interface Message {
  sender: "user" | "yeti";
  message: string;
  time?: string;
}

export const useChat = () => {
  const [input, setInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { connectedPlatforms } = usePlatforms();
  const { user } = useUser();

  // Initialize with dynamic welcome message - only once
  useEffect(() => {
    if (!hasInitialized) {
      const welcomeMessage = connectedPlatforms.length > 0
        ? `Hello! 👋 I'm Yeti, your AI assistant with memory. I can help with general questions, coding, research, and I can see you have ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected: ${connectedPlatforms.map(p => p.name).join(', ')}. I can also help automate tasks across these platforms. What would you like to know or do today?`
        : "Hello! 👋 I'm Yeti, your AI assistant with memory. I can help you with general questions, provide information on any topic, assist with coding, solve problems, and much more! You can also connect platforms from the sidebar to unlock automation capabilities. What would you like to know?";

      setMessages([{
        sender: "yeti",
        message: welcomeMessage,
        time: getNow()
      }]);
      setHasInitialized(true);
    }
  }, [connectedPlatforms, hasInitialized]);

  const handleSend = async () => {
    if (!input.trim() || isBotThinking) return;
    
    const newMessage: Message = { 
      sender: "user", 
      message: input.trim(), 
      time: getNow() 
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsBotThinking(true);

    try {
      const response = await aiService.generateResponse(
        newMessage.message, 
        connectedPlatforms,
        user?.id
      );
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "yeti",
          message: response,
          time: getNow(),
        },
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "yeti",
          message: "🧊 I encountered an error while processing your request. Please try again.",
          time: getNow(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const startNewSession = () => {
    aiService.startNewSession();
    setMessages([{
      sender: "yeti",
      message: "🧊 Starting a fresh conversation! How can I help you today?",
      time: getNow()
    }]);
  };
  
  return {
    input,
    setInput,
    messages,
    isBotThinking,
    handleSend,
    connectedPlatforms,
    startNewSession
  };
};
