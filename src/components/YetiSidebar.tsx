
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Plus, Zap, Sparkles, MessageCircle, Workflow } from "lucide-react";
import { usePlatforms } from "@/hooks/usePlatforms";
import { platformCategories } from "@/data/platforms";
import { SettingsDialog } from "./SettingsDialog";
import { AutomationDialog } from "./AutomationDialog";

interface YetiSidebarProps {
  onShowConnections: () => void;
  onShowWorkflows?: () => void;
  currentView?: 'chat' | 'connections' | 'workflows';
  onShowChat?: () => void;
}

export function YetiSidebar({ onShowConnections, onShowWorkflows, currentView, onShowChat }: YetiSidebarProps) {
  const { connectedPlatforms, selectedCategory, setSelectedCategory } = usePlatforms();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);

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
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            {connectedPlatforms?.length || 0}
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
                    <MessageCircle className="w-4 h-4" />
                    Chat with Yeti
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
                {onShowWorkflows && (
                  <Button
                    variant={currentView === 'workflows' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3 h-10 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={onShowWorkflows}
                  >
                    <Workflow className="w-4 h-4" />
                    Workflow Hub
                  </Button>
                )}
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
            {connectedPlatforms && connectedPlatforms.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Connected Platforms</h3>
                  <div className="space-y-2">
                    {connectedPlatforms.slice(0, 5).map((platform) => (
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
                    {connectedPlatforms.length > 5 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-slate-600 hover:text-slate-800" 
                        onClick={onShowConnections}
                      >
                        View all {connectedPlatforms.length} platforms
                      </Button>
                    )}
                  </div>
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
