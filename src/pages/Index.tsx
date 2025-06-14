
import { useState } from "react";
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";
import { ConnectionsView } from "@/components/ConnectionsView";

type View = 'chat' | 'connections';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('chat');

  const handleShowConnections = () => {
    console.log('Switching to connections view');
    setCurrentView('connections');
  };

  const handleShowChat = () => {
    console.log('Switching to chat view');
    setCurrentView('chat');
  };

  return (
    <div className="h-screen flex bg-slate-50">
      <YetiSidebar 
        onShowConnections={handleShowConnections}
        currentView={currentView}
        onShowChat={handleShowChat}
      />
      
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
