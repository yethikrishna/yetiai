
import { useState, useEffect } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { generateResponse, getNow } from '@/lib/yeti/responses';

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

  const handleSend = () => {
    if (!input.trim() || isBotThinking) return;
    
    const newMessage: Message = { 
      sender: "user", 
      message: input.trim(), 
      time: getNow() 
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsBotThinking(true);

    setTimeout(() => {
      const response = generateResponse(newMessage.message, connectedPlatforms);
      setMessages((prev) => [
        ...prev,
        {
          sender: "yeti",
          message: response,
          time: getNow(),
        },
      ]);
      setIsBotThinking(false);
    }, 1100 + Math.random() * 800);
  };
  
  return {
    input,
    setInput,
    messages,
    isBotThinking,
    handleSend,
    connectedPlatforms
  };
};
