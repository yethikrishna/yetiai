
import { useState } from "react";
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";
import { ConnectionsView } from "@/components/ConnectionsView";
import { AuthWrapper } from "@/components/AuthWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

type View = 'chat' | 'connections';

const Index = () => {
  console.log('Index page loading...');
  
  const [currentView, setCurrentView] = useState<View>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleShowConnections = () => {
    console.log('Switching to connections view');
    setCurrentView('connections');
    if (isMobile) setSidebarOpen(false);
  };

  const handleShowChat = () => {
    console.log('Switching to chat view');
    setCurrentView('chat');
    if (isMobile) setSidebarOpen(false);
  };

  console.log('Index page rendering with view:', currentView);

  return (
    <AuthWrapper>
      <div className="h-screen flex bg-slate-50 relative">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
          }
        `}>
          <YetiSidebar 
            onShowConnections={handleShowConnections}
            currentView={currentView}
            onShowChat={handleShowChat}
          />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentView === 'chat' ? (
            <YetiChatWindow onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          ) : (
            <div className="flex-1 overflow-auto p-3 sm:p-6">
              <div className="max-w-7xl mx-auto">
                <ConnectionsView />
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;
