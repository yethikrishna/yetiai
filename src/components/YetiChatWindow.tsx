
import { useState, useRef, useEffect } from "react";
import { YetiMessageBubble } from "./YetiMessageBubble";
import { SendHorizonal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  sender: "user" | "yeti";
  message: string;
  time?: string;
}

const getNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const initialMessages: Message[] = [
  {
    sender: "yeti",
    message: "Hello! 👋 I'm Yeti, your friendly multi-platform AI assistant. Ask me anything, or connect a platform on the left to get started!",
    time: getNow()
  },
];

export function YetiChatWindow() {
  const [input, setInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotThinking]);

  const handleSend = () => {
    if (!input.trim() || isBotThinking) return;
    const newMessage: Message = { sender: "user", message: input.trim(), time: getNow() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsBotThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "yeti",
          message: `🧊 Sorry! I'm just a snowball right now and don't have real connections yet. But soon I'll connect to platforms, run code, and retrieve info for you!`,
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
