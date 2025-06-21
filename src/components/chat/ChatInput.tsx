
import { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { Platform } from '@/types/platform';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isBotThinking: boolean;
  connectedPlatforms: Platform[];
}

export function ChatInput({ input, setInput, handleSend, isBotThinking, connectedPlatforms }: ChatInputProps) {
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <Button variant="outline" size="icon" className="mb-1">
            <Plus className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                connectedPlatforms.length > 0
                  ? `Message Yeti... (Connected to ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'})`
                  : "Message Yeti... Try asking in any language!"
              }
              className="min-h-[50px] max-h-32 resize-none pr-12"
              disabled={isBotThinking}
            />
          </div>

          <VoiceInput 
            onTranscript={handleVoiceTranscript}
            disabled={isBotThinking}
          />
          
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isBotThinking}
            className="mb-1"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            🧊 Yeti AI v18.0 • {connectedPlatforms.length} platforms connected
          </span>
          <span>
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
