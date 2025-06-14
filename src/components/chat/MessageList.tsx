
import { useEffect, useRef } from 'react';
import { YetiMessageBubble } from "@/components/YetiMessageBubble";
import { Loader2 } from "lucide-react";
import { Message } from '@/hooks/useChat';

interface MessageListProps {
  messages: Message[];
  isBotThinking: boolean;
}

export function MessageList({ messages, isBotThinking }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotThinking]);

  return (
    <section className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {messages.map((m, i) => (
          <YetiMessageBubble key={i} sender={m.sender} message={m.message} time={m.time} />
        ))}
        {isBotThinking && (
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-base">
              🧊
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-500" />
              <span className="text-slate-600 text-xs sm:text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
    </section>
  );
}
