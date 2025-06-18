
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConnectionsView } from "@/components/ConnectionsView";
import { SettingsDialog } from "@/components/SettingsDialog";
import { McpTestPanel } from "@/components/McpTestPanel";
import { AutomationDialog } from "@/components/AutomationDialog";
import { 
  Settings, 
  MessageSquare, 
  Zap, 
  TestTube, 
  Link, 
  Network,
  Home,
  ExternalLink
} from "lucide-react";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface YetiSidebarProps {
  onShowConnections: () => void;
  currentView: string;
  onShowChat: () => void;
}

export function YetiSidebar({ onShowConnections, currentView, onShowChat }: YetiSidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpTestOpen, setMcpTestOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: "chat", label: "Chat", icon: MessageSquare, onClick: onShowChat },
    { id: "connections", label: "Connections", icon: Link, onClick: onShowConnections },
    { id: "automation", label: "Automation", icon: Zap, onClick: () => setAutomationOpen(true) },
    { id: "mcp-test", label: "MCP Test", icon: TestTube, onClick: () => setMcpTestOpen(prev => !prev) },
  ];

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <span className="font-semibold text-lg">Yeti AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {mcpTestOpen ? (
          <div className="h-full flex flex-col">
            <Button
              variant="outline"
              className="mb-4 w-full justify-start gap-2"
              onClick={() => setMcpTestOpen(false)}
            >
              {/* Using a generic icon like ArrowLeft, assuming lucide-react import */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Navigation
            </Button>
            <div className="flex-1 overflow-y-auto">
              <McpTestPanel />
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Link */}
            <RouterLink to="/">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </RouterLink>

            {/* Chat and Local Views */}
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id && item.id !== 'mcp-test' ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={item.onClick}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}

            {/* Platforms Connect - External Page */}
            <RouterLink to="/platforms">
              <Button
                variant={location.pathname === "/platforms" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Network className="h-4 w-4" />
                Connect Platforms
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </RouterLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      {/* McpTestPanel is no longer a dialog, rendered conditionally in nav */}
      
      <AutomationDialog open={automationOpen} onOpenChange={setAutomationOpen} />
    </aside>
  );
}
