
import React from 'react';
import { SendHorizonal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Platform } from "@/types/platform";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isBotThinking: boolean;
  connectedPlatforms: Platform[];
}

export function ChatInput({ input, setInput, handleSend, isBotThinking, connectedPlatforms }: ChatInputProps) {
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            {connectedPlatforms.length === 0 
              ? "Connect platforms to unlock Yeti's full potential"
              : `🤖 AI-powered responses via Groq • ${connectedPlatforms.length} platforms connected`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
