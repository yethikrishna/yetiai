
import { useState, useRef, useEffect } from "react";
import { YetiMessageBubble } from "./YetiMessageBubble";
import { SendHorizonal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatforms } from "@/hooks/usePlatforms";

interface Message {
  sender: "user" | "yeti";
  message: string;
  time?: string;
}

const getNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function YetiChatWindow() {
  const [input, setInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectedPlatforms } = usePlatforms();

  // Initialize with dynamic welcome message
  useEffect(() => {
    const welcomeMessage = connectedPlatforms.length > 0
      ? `Hello! 👋 I'm Yeti, your AI assistant. I can see you have ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected: ${connectedPlatforms.map(p => p.name).join(', ')}. What would you like me to help you with today?`
      : "Hello! 👋 I'm Yeti, your friendly multi-platform AI assistant. Connect some platforms from the sidebar to unlock my full potential, or just chat with me!";

    setMessages([{
      sender: "yeti",
      message: welcomeMessage,
      time: getNow()
    }]);
  }, [connectedPlatforms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotThinking]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Platform-specific responses
    if (lowerMessage.includes('github') && connectedPlatforms.some(p => p.id === 'github')) {
      return "🧊 I can help you with GitHub! I can create repositories, manage issues, review pull requests, and more. What would you like me to do?";
    }
    
    if (lowerMessage.includes('email') || lowerMessage.includes('gmail')) {
      const hasEmail = connectedPlatforms.some(p => p.id === 'gmail' || p.id === 'outlook');
      if (hasEmail) {
        return "📧 I can help you manage your emails! I can read, send, organize, and even draft responses. What email task can I assist with?";
      } else {
        return "📧 I'd love to help with emails! Please connect Gmail or Outlook first from the connections page.";
      }
    }

    if (lowerMessage.includes('social') || lowerMessage.includes('twitter') || lowerMessage.includes('post')) {
      const socialPlatforms = connectedPlatforms.filter(p => p.category === 'social-media');
      if (socialPlatforms.length > 0) {
        return `📱 I can help with your social media! You have ${socialPlatforms.map(p => p.name).join(', ')} connected. I can post updates, schedule content, analyze engagement, and more!`;
      } else {
        return "📱 I can help with social media management! Connect platforms like Twitter, LinkedIn, or Instagram to get started.";
      }
    }

    if (lowerMessage.includes('ai') || lowerMessage.includes('gpt') || lowerMessage.includes('openai')) {
      const hasAI = connectedPlatforms.some(p => p.category === 'ai-tools');
      if (hasAI) {
        return "🤖 Perfect! I can leverage your connected AI tools to help with content generation, analysis, coding assistance, and more complex tasks!";
      } else {
        return "🤖 I can help you connect to AI platforms like OpenAI, Claude, or Hugging Face to supercharge my capabilities!";
      }
    }

    if (lowerMessage.includes('automate') || lowerMessage.includes('workflow')) {
      return `⚡ I love automation! With your ${connectedPlatforms.length} connected platforms, we can create powerful workflows. I can help you set up cross-platform automations, scheduled tasks, and smart triggers.`;
    }

    // General responses based on connected platforms
    if (connectedPlatforms.length > 0) {
      const capabilities = [
        "cross-platform data sync",
        "automated workflows",
        "content management",
        "data analysis",
        "smart notifications"
      ];
      return `🧊 With your connected platforms (${connectedPlatforms.map(p => p.name).join(', ')}), I can help with ${capabilities.slice(0, 3).join(', ')}, and much more! What specific task would you like assistance with?`;
    }

    // Default responses for unconnected state
    const responses = [
      "🧊 I'm still growing my capabilities! Right now I'm in demo mode, but soon I'll be able to perform real actions across all your connected platforms.",
      "❄️ That's an interesting request! Once you connect some platforms, I'll be able to help you with actual tasks and automations.",
      "🧊 I'm excited to help! Connect some platforms from the sidebar and I'll show you what I can really do.",
      "❄️ Great question! I'm designed to work across multiple platforms. Connect a few and let's see what we can accomplish together!"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

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
      const response = generateResponse(newMessage.message);
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <main className="relative flex flex-col h-full w-full">
      {/* Chat history */}
      <section className="flex-1 px-8 pt-12 pb-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {messages.map((m, i) => (
            <YetiMessageBubble key={i} sender={m.sender} message={m.message} time={m.time} />
          ))}
          {isBotThinking && (
            <div className="flex mb-2 justify-start items-center space-x-2 pl-8">
              <span className="animate-bounce text-3xl">🧊</span>
              <span className="italic text-muted-foreground animate-pulse flex items-center text-base">
                <Loader2 className="mr-1 animate-spin" size={16} /> Thinking...
              </span>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </section>
      
      {/* Input bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-border px-6 py-4 bg-white/95 backdrop-blur-lg flex items-center gap-3"
      >
        <Input
          autoFocus
          disabled={isBotThinking}
          placeholder="Ask Yeti anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-slate-50 focus:bg-white"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isBotThinking || !input.trim()}
          className="rounded-full bg-blue-700 hover:bg-blue-800 text-white"
        >
          <SendHorizonal size={22} />
        </Button>
      </form>
    </main>
  );
}
