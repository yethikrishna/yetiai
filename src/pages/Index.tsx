
import { useState } from "react";
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";
import { ConnectionsView } from "@/components/ConnectionsView";
import { cn } from "@/lib/utils";

const Index = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'connections'>('chat');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <YetiSidebar onShowConnections={() => setCurrentView('connections')} />
      
      <section className="flex-1 flex flex-col h-screen">
        {/* Modern Header */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧊</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Yeti
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('chat')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentView === 'chat' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Chat
            </button>
            <button
              onClick={() => setCurrentView('connections')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentView === 'connections' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Connections
            </button>
            <div className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
              Alpha
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {currentView === 'chat' ? <YetiChatWindow /> : <ConnectionsView />}
        </div>
      </section>
    </div>
  );
};

export default Index;
