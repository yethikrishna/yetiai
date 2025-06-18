
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Grid, List, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { AppCard } from './AppCard';
import { usePipedreamApps } from '@/hooks/usePipedreamApps';
import { usePipedreamConnect } from '@/hooks/usePipedreamConnect';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CATEGORIES = [
  { id: 'all', name: 'All Categories', count: 0 },
  { id: 'communication', name: 'Communication', count: 0 },
  { id: 'productivity', name: 'Productivity', count: 0 },
  { id: 'social', name: 'Social Media', count: 0 },
  { id: 'ecommerce', name: 'E-commerce', count: 0 },
  { id: 'crm', name: 'CRM', count: 0 },
  { id: 'development', name: 'Developer Tools', count: 0 },
  { id: 'finance', name: 'Finance', count: 0 },
  { id: 'marketing', name: 'Marketing', count: 0 },
  { id: 'storage', name: 'Cloud Storage', count: 0 },
  { id: 'ai', name: 'AI & ML', count: 0 }
];

export function PlatformsConnectView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [connectionFilter, setConnectionFilter] = useState<'all' | 'connected' | 'available'>('all');
  
  const { 
    apps, 
    isLoading, 
    error, 
    connectedApps, 
    loadApps, 
    searchApps 
  } = usePipedreamApps();
  
  const { connectAccount, isConnecting } = usePipedreamConnect();

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const delayedSearch = setTimeout(() => {
        searchApps(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory);
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      loadApps(selectedCategory === 'all' ? undefined : selectedCategory);
    }
  }, [searchQuery, selectedCategory]);

  const handleConnect = async (appId: string, appName: string) => {
    try {
      await connectAccount(appId);
    } catch (error) {
      console.error(`Failed to connect to ${appName}:`, error);
    }
  };

  const filteredApps = apps.filter(app => {
    const isConnected = connectedApps.some(connected => connected.app === app.name_slug);
    
    if (connectionFilter === 'connected' && !isConnected) return false;
    if (connectionFilter === 'available' && isConnected) return false;
    
    return true;
  });

  const stats = {
    total: apps.length,
    connected: connectedApps.length,
    available: apps.length - connectedApps.length
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Connect Platforms</h1>
          <p className="text-slate-600 mt-2">
            Connect to 2,700+ apps and services through Pipedream's powerful integration platform.
          </p>
        </div>
        
        <Alert>
          <AlertDescription>
            {error}. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Connect Platforms</h1>
          <p className="text-slate-600 mt-2">
            Connect to 2,700+ apps and services through Pipedream's powerful integration platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Apps</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
              <div className="text-sm text-gray-600">Connected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.available}</div>
              <div className="text-sm text-gray-600">Available</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={connectionFilter} onValueChange={(value: any) => setConnectionFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Connection Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              <SelectItem value="connected">Connected Only</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || selectedCategory !== 'all' || connectionFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setConnectionFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Apps Grid/List */}
      {!isLoading && (
        <>
          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchQuery ? 'No apps found matching your search.' : 'No apps available.'}
              </div>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
            }>
              {filteredApps.map((app) => (
                <AppCard
                  key={app.name_slug}
                  app={app}
                  isConnected={connectedApps.some(connected => connected.app === app.name_slug)}
                  onConnect={() => handleConnect(app.name_slug, app.name)}
                  isConnecting={isConnecting}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer Info */}
      <div className="border-t pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredApps.length} of {apps.length} apps
          </div>
          <a 
            href="https://pipedream.com/apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            Browse all apps on Pipedream
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
