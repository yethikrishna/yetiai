
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Plus, Zap, Sparkles, MessageCircle, ArrowLeft } from "lucide-react";
import { usePlatforms } from "@/hooks/usePlatforms";
import { usePipedreamMcp } from "@/hooks/usePipedreamMcp";
import { platformCategories } from "@/data/platforms";
import { SettingsDialog } from "./SettingsDialog";
import { AutomationDialog } from "./AutomationDialog";

interface YetiSidebarProps {
  onShowConnections: () => void;
  currentView?: 'chat' | 'connections';
  onShowChat?: () => void;
}

export function YetiSidebar({ onShowConnections, currentView, onShowChat }: YetiSidebarProps) {
  const { connectedPlatforms, selectedCategory, setSelectedCategory } = usePlatforms();
  const { getConnectionCount } = usePipedreamMcp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);

  const totalConnections = (connectedPlatforms?.length || 0) + getConnectionCount();

  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
    setSelectedCategory(categoryId as any);
    onShowConnections();
  };

  return (
    <>
      <aside className="w-64 h-full flex flex-col bg-white border-r border-slate-200 shadow-sm">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧊</span>
            <span className="text-lg font-bold text-slate-900">Yeti</span>
            <Badge className="bg-green-100 text-green-800 text-xs">
              Autonomous
            </Badge>
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            {totalConnections}
          </Badge>
        </div>

        <ScrollArea className="flex-1 py-4">
          <div className="px-4 space-y-6">
            {/* View Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Navigation
              </h3>
              <div className="space-y-2">
                {onShowChat && (
                  <Button
                    variant={currentView === 'chat' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3 h-10 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={onShowChat}
                  >
                    {currentView === 'connections' ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {currentView === 'connections' ? 'Back to Chat' : 'Chat with Yeti'}
                  </Button>
                )}
                <Button
                  variant={currentView === 'connections' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-10 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  onClick={onShowConnections}
                >
                  <Plus className="w-4 h-4" />
                  Connect Platform
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => setAutomationOpen(true)}
                >
                  <Zap className="w-4 h-4" />
                  Create Automation
                </Button>
              </div>
            </div>

            {/* Connected Platforms */}
            {totalConnections > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Connected Platforms ({totalConnections})
                  </h3>
                  <div className="space-y-2">
                    {connectedPlatforms && connectedPlatforms.slice(0, 3).map((platform) => (
                      <div key={platform.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {platform.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                          {platform.name}
                        </span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                    ))}
                    
                    {getConnectionCount() > 0 && (
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                          Pipedream Apps ({getConnectionCount()})
                        </span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                    
                    {totalConnections > 4 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-slate-600 hover:text-slate-800" 
                        onClick={onShowConnections}
                      >
                        View all {totalConnections} platforms
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Autonomous Status */}
            {totalConnections > 0 && (
              <>
                <Separator />
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">Autonomous Mode Active</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Yeti AI can take actions on your connected platforms automatically when appropriate.
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Platform Categories */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Browse Categories</h3>
              <div className="space-y-1">
                {platformCategories && platformCategories.slice(0, 6).map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-between text-xs hover:bg-blue-50 hover:text-blue-700 ${
                      selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <span className="truncate">{category.name}</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
                {platformCategories && platformCategories.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-500 hover:text-slate-700"
                    onClick={onShowConnections}
                  >
                    View all categories
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AutomationDialog open={automationOpen} onOpenChange={setAutomationOpen} />
    </>
  );
}
