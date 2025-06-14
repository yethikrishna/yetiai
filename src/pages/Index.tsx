
import { useState } from "react";
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";
import { ConnectionsView } from "@/components/ConnectionsView";

const Index = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'connections'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex">
      <YetiSidebar onShowConnections={() => setCurrentView('connections')} />
      <section className="flex-1 flex flex-col h-screen">
        <header className="h-20 flex px-8 py-2 items-center border-b border-border bg-white/70 backdrop-blur-md shadow-sm">
          <span className="text-2xl font-semibold flex items-center gap-2 text-blue-900">
            Welcome to <span className="font-extrabold tracking-tight">Yeti</span> Chatbot
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setCurrentView('chat')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                currentView === 'chat' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setCurrentView('connections')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                currentView === 'connections' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Connections
            </button>
            <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium">
              Alpha
            </span>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          {currentView === 'chat' ? <YetiChatWindow /> : <ConnectionsView />}
        </div>
      </section>
    </div>
  );
};

export default Index;
