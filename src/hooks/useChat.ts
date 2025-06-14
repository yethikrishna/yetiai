
import { useState, useEffect } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { groqService } from '@/lib/groq/groqService';
import { getNow } from '@/lib/yeti/responses';

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
  const [apiKey, setApiKey] = useState<string>("");
  const { connectedPlatforms } = usePlatforms();

  // Load API key from localStorage on init
  useEffect(() => {
    const savedApiKey = localStorage.getItem('groq-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      groqService.setApiKey(savedApiKey);
    }
  }, []);

  // Initialize with dynamic welcome message - only once
  useEffect(() => {
    if (!hasInitialized) {
      const welcomeMessage = connectedPlatforms.length > 0
        ? `Hello! 👋 I'm Yeti, your AI assistant. I can see you have ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected: ${connectedPlatforms.map(p => p.name).join(', ')}. What would you like me to help you with today?`
        : "Hello! 👋 I'm Yeti, your friendly multi-platform AI assistant. Connect some platforms from the sidebar to unlock my full potential, or just chat with me!";

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
      const response = await groqService.generateResponse(newMessage.message, connectedPlatforms);
      
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
          message: "🧊 I encountered an error while processing your request. Please try again or check your API key.",
          time: getNow(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    groqService.setApiKey(newApiKey);
  };
  
  return {
    input,
    setInput,
    messages,
    isBotThinking,
    handleSend,
    connectedPlatforms,
    apiKey,
    handleApiKeySet
  };
};
