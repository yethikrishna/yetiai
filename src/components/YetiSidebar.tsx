
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Plus, Zap } from "lucide-react";
import { usePlatforms } from "@/hooks/usePlatforms";
import { platformCategories } from "@/data/platforms";

interface YetiSidebarProps {
  onShowConnections: () => void;
}

export function YetiSidebar({ onShowConnections }: YetiSidebarProps) {
  const { connectedPlatforms, selectedCategory, setSelectedCategory } = usePlatforms();

  return (
    <aside className="w-60 h-full flex flex-col bg-gradient-to-b from-blue-50/80 to-blue-200/70 border-r border-border p-0">
      <div className="h-20 flex px-6 items-center border-b border-border">
        <span className="text-2xl font-extrabold text-blue-900">🧊 Yeti</span>
        <Badge className="ml-2 bg-green-100 text-green-800">
          {connectedPlatforms.length} connected
        </Badge>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-4 space-y-4">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-100/70"
                onClick={onShowConnections}
              >
                <Plus size={18} />
                <span className="ml-2">Connect Platform</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-100/70"
              >
                <Zap size={18} />
                <span className="ml-2">Create Automation</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Connected Platforms */}
          {connectedPlatforms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Connected</h3>
              <div className="space-y-1">
                {connectedPlatforms.slice(0, 5).map((platform) => (
                  <div key={platform.id} className="flex items-center gap-2 p-2 rounded hover:bg-blue-50">
                    {platform.icon}
                    <span className="text-sm font-medium">{platform.name}</span>
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
                {connectedPlatforms.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onShowConnections}>
                    +{connectedPlatforms.length - 5} more
                  </Button>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Platform Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
            <div className="space-y-1">
              {platformCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-between text-xs hover:bg-blue-100/70 ${
                    selectedCategory === category.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id as any)}
                >
                  <span>{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings size={16} />
          <span className="ml-2">Settings</span>
        </Button>
      </div>

      <div className="p-4 mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>Made with ❄️</span>
        <a href="https://lovable.dev" className="hover:underline text-blue-700" target="_blank" rel="noopener noreferrer">
          Lovable
        </a>
      </div>
    </aside>
  );
}
