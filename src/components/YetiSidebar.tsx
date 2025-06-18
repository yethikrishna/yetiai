
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
  activeView: string;
  setActiveView: (view: string) => void;
}

export function YetiSidebar({ activeView, setActiveView }: YetiSidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpTestOpen, setMcpTestOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "connections", label: "Connections", icon: Link },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "mcp-test", label: "MCP Test", icon: TestTube },
  ];

  const handleMenuClick = (itemId: string) => {
    if (itemId === "automation") {
      setAutomationOpen(true);
    } else if (itemId === "mcp-test") {
      setMcpTestOpen(true);
    } else {
      setActiveView(itemId);
    }
  };

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
            variant={activeView === item.id ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => handleMenuClick(item.id)}
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
      
      <McpTestPanel open={mcpTestOpen} onOpenChange={setMcpTestOpen} />
      
      <AutomationDialog open={automationOpen} onOpenChange={setAutomationOpen} />
    </aside>
  );
}
