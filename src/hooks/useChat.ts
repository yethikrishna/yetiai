
import { useState, useEffect } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { aiService } from '@/lib/ai/aiService';
import { yetiAgent } from '@/lib/ai/yetiAgent';
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
        ? `Hello! 👋 I'm Yeti, your AI-powered automation assistant! I can see you have ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected: ${connectedPlatforms.map(p => p.name).join(', ')}. 

🤖 **I can help you:**
• **Automate workflows** across all your platforms
• **Deploy projects** from GitHub to Vercel, Netlify, etc.
• **Post content** to all your social media at once
• **Generate AI content** and distribute it automatically
• **Set up customer support** automation
• **Create development pipelines** end-to-end

Try saying: "Post this message to all my social media" or "Create a React project and deploy it everywhere" or visit the **Workflow Hub** in the sidebar!`
        : "Hello! 👋 I'm Yeti, your AI-powered automation assistant! I can help with questions, coding, research, and create powerful cross-platform workflows. Connect platforms from the sidebar to unlock **massive automation capabilities** like:\n\n🚀 **Full development pipelines** (GitHub → Vercel/Netlify)\n📱 **Cross-platform social media** campaigns\n🤖 **AI-powered content** generation & distribution\n⚡ **Automated customer support**\n\nWhat would you like to automate today?";

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
      // Check if this looks like a workflow/automation command
      const automationKeywords = ['automate', 'deploy', 'post', 'create', 'workflow', 'schedule', 'generate', 'upload', 'share'];
      const isAutomationCommand = automationKeywords.some(keyword => 
        newMessage.message.toLowerCase().includes(keyword)
      );

      let response: string;
      
      if (isAutomationCommand && user?.id) {
        console.log('🤖 Processing as automation command with Yeti Agent');
        // Use Yeti Agent for automation commands
        const agentResponse = await yetiAgent.processNaturalLanguage(newMessage.message, user.id);
        response = agentResponse.message;
        
        // Add suggested workflows if any
        if (agentResponse.suggestedWorkflows && agentResponse.suggestedWorkflows.length > 0) {
          response += `\n\n💡 **Suggested Workflows:**\n${agentResponse.suggestedWorkflows.map(w => `• ${w}`).join('\n')}`;
        }
        
        // Add execution info if available
        if (agentResponse.executionId) {
          response += `\n\n🚀 **Workflow Started:** ${agentResponse.executionId}`;
        }
      } else {
        // Use regular AI service for general questions
        response = await aiService.generateResponse(
          newMessage.message, 
          connectedPlatforms,
          user?.id
        );
      }
      
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
