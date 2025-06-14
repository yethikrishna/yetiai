
import React from 'react';
import { SendHorizonal } from "lucide-react";
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
    <div className="flex-shrink-0 px-2 sm:px-4 py-3 sm:py-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <Input
            autoFocus
            disabled={isBotThinking}
            placeholder="Message Yeti..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 placeholder-slate-500 text-sm sm:text-base h-8 sm:h-10"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isBotThinking || !input.trim()}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 h-8 w-8 sm:h-10 sm:w-10"
          >
            <SendHorizonal className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1">
          <p className="text-xs text-slate-500 truncate">
            {connectedPlatforms.length === 0 
              ? "Connect platforms to unlock Yeti's full potential"
              : `🤖 AI-powered • ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'} connected`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
