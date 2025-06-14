
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    <main className="relative flex flex-col h-full w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
            🧊
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Yeti AI Assistant</h2>
            <p className="text-sm text-slate-600">
              {connectedPlatforms.length > 0 
                ? `Connected to ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'}`
                : 'Ready to help you connect and automate'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <YetiMessageBubble key={i} sender={m.sender} message={m.message} time={m.time} />
          ))}
          {isBotThinking && (
            <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                🧊
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-slate-600 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </section>
      
      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <Input
              autoFocus
              disabled={isBotThinking}
              placeholder="Message Yeti..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 placeholder-slate-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isBotThinking || !input.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              <SendHorizonal size={18} />
            </Button>
          </form>
          {connectedPlatforms.length === 0 && (
            <p className="text-center text-xs text-slate-500 mt-2">
              Connect platforms to unlock Yeti's full potential
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
