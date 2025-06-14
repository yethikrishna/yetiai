
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { ChatInput } from "./chat/ChatInput";
import { ApiKeyInput } from "./ApiKeyInput";

export function YetiChatWindow() {
  const {
    input,
    setInput,
    messages,
    isBotThinking,
    handleSend,
    connectedPlatforms,
    apiKey,
    handleApiKeySet
  } = useChat();

  // Show API key input if no key is set
  if (!apiKey) {
    return (
      <main className="relative flex flex-col h-full w-full bg-gradient-to-b from-slate-50 to-white">
        <ChatHeader connectedPlatforms={connectedPlatforms} />
        <div className="flex-1 flex items-center justify-center p-6">
          <ApiKeyInput onApiKeySet={handleApiKeySet} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col h-full w-full bg-gradient-to-b from-slate-50 to-white">
      <ChatHeader connectedPlatforms={connectedPlatforms} />
      <MessageList messages={messages} isBotThinking={isBotThinking} />
      <ChatInput 
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isBotThinking={isBotThinking}
        connectedPlatforms={connectedPlatforms}
      />
    </main>
  );
}
