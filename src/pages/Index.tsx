
import { useState } from "react";
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";
import { ConnectionsView } from "@/components/ConnectionsView";

type View = 'chat' | 'connections';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('chat');

  return (
    <div className="h-screen flex bg-slate-50">
      <YetiSidebar onShowConnections={() => setCurrentView('connections')} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {currentView === 'chat' ? (
          <YetiChatWindow />
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <ConnectionsView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
