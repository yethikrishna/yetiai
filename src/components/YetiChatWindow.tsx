
import { useRef, useEffect } from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { MessageList } from './chat/MessageList';
import { useChat } from '@/hooks/useChat';

interface YetiChatWindowProps {
  onToggleSidebar: () => void;
}

export function YetiChatWindow({ onToggleSidebar }: YetiChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    input,
    setInput,
    messages,
    isBotThinking,
    handleSend,
    connectedPlatforms,
    startNewSession
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader 
        connectedPlatforms={connectedPlatforms} 
        onToggleSidebar={onToggleSidebar}
        onNewSession={startNewSession}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList messages={messages} isBotThinking={isBotThinking} />
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isBotThinking={isBotThinking}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}
