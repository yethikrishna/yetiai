
import { useState, useEffect } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { agenticService } from '@/lib/ai/agenticService';
import { getNow } from '@/lib/yeti/responses';
import { useUser } from '@clerk/clerk-react';

export interface Message {
  sender: "user" | "yeti";
  message: string;
  time?: string;
  isAgentic?: boolean;
  decisions?: any[];
  executedActions?: any[];
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
        ? `Hello! 👋 I'm Yeti, your autonomous AI assistant. I can see you have ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected: ${connectedPlatforms.map(p => p.name).join(', ')}.\n\n🤖 **Autonomous Mode**: I can now take actions on your behalf when appropriate. I'll ask for permission for sensitive operations and adapt based on your feedback.\n\nWhat would you like me to help you with today?`
        : "Hello! 👋 I'm Yeti, your autonomous AI assistant. I can help you with questions, research, coding, and much more!\n\n🔗 Connect platforms from the sidebar to unlock autonomous automation capabilities where I can take actions on your behalf.\n\nWhat would you like to know or do today?";

      setMessages([{
        sender: "yeti",
        message: welcomeMessage,
        time: getNow(),
        isAgentic: true
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
      // Use agentic service for autonomous decision-making
      const agenticResponse = await agenticService.processRequest(
        newMessage.message, 
        connectedPlatforms,
        user?.id
      );
      
      let responseMessage = agenticResponse.response;
      
      // Add autonomous action indicators
      if (agenticResponse.executedActions.length > 0) {
        responseMessage += "\n\n🤖 **Autonomous Actions Taken**: " + 
          agenticResponse.executedActions.map(action => 
            `${action.platform}: ${action.summary}`
          ).join(', ');
      }
      
      if (agenticResponse.needsUserInput) {
        responseMessage += "\n\n💭 **Waiting for your input** to proceed with the next steps.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "yeti",
          message: responseMessage,
          time: getNow(),
          isAgentic: true,
          decisions: agenticResponse.decisions,
          executedActions: agenticResponse.executedActions
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
    setMessages([{
      sender: "yeti",
      message: "🧊 Starting a fresh conversation! How can I help you today?",
      time: getNow(),
      isAgentic: true
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
