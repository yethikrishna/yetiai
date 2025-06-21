
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Settings, 
  Plus, 
  Filter,
  TestTube,
  BarChart3,
  Cpu,
  Zap
} from 'lucide-react';
import { ConnectionsView } from '@/components/ConnectionsView';
import { SettingsDialog } from '@/components/SettingsDialog';
import { usePlatforms } from '@/hooks/usePlatforms';
import { PlatformCategory } from '@/types/platform';
import { Link, useLocation } from 'react-router-dom';

interface YetiSidebarProps {
  onShowConnections?: () => void;
  currentView?: 'chat' | 'connections';
  onShowChat?: () => void;
}

export function YetiSidebar({ onShowConnections, currentView, onShowChat }: YetiSidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { selectedCategory, setSelectedCategory } = usePlatforms();
  const location = useLocation();

  const categories: { value: PlatformCategory | 'all'; label: string; count?: number }[] = [
    { value: 'all', label: 'All Platforms' },
    { value: 'ai-tools', label: 'AI Tools' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'development', label: 'Development' },
    { value: 'email', label: 'Email' },
    { value: 'workplace', label: 'Workplace' },
    { value: 'website-builders', label: 'Website Builders' },
    { value: 'file-storage', label: 'File Storage' },
  ];

  const navigationItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/model-config', icon: Cpu, label: 'AI Models' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/mcp-test', icon: TestTube, label: 'MCP Test' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🧊</span>
            </div>
            <h1 className="font-bold text-xl text-gray-900">Yeti AI</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Built by Yethikrishna R • Yeti Lang v18.0
        </p>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "default" : "ghost"} 
                  className="w-full justify-start gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Platform Categories Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Platforms</span>
        </div>
        
        <div className="space-y-1">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Platform Connections */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <ConnectionsView />
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </div>
  );
}
