import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Zap, CheckCircle, Circle, ExternalLink, Settings } from "lucide-react";
import { PipedreamApp } from "@/types/pipedream";
import { fetchPipedreamApps, searchPipedreamApps, getAvailableCategories } from "@/lib/pipedream/pipedreamService";
import { usePipedreamMcp } from "@/hooks/usePipedreamMcp";
import { useToast } from "@/hooks/use-toast";
import { PipedreamConnectionDialog } from "./pipedream/PipedreamConnectionDialog";

export function PipedreamConnectView() {
  const [apps, setApps] = useState<PipedreamApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<PipedreamApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PipedreamApp | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const { connectedApps, disconnectApp, isAppConnected, getConnectionCount } = usePipedreamMcp();
  const { toast } = useToast();

  useEffect(() => {
    loadApps();
    loadCategories();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchQuery, selectedCategory]);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      const allApps = await fetchPipedreamApps();
      setApps(allApps);
      setFilteredApps(allApps);
    } catch (error) {
      console.error("Failed to load apps:", error);
      toast({
        title: "Error",
        description: "Failed to load Pipedream apps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const availableCategories = await getAvailableCategories();
      setCategories(availableCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const filterApps = async () => {
    let filtered = apps;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = await searchPipedreamApps(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(app => app.categories.includes(selectedCategory));
    }

    setFilteredApps(filtered);
  };

  const handleConnect = (app: PipedreamApp) => {
    setSelectedApp(app);
    setIsConnectionDialogOpen(true);
  };

  const handleConnectionSuccess = (appSlug: string) => {
    toast({
      title: "Connected Successfully",
      description: `Successfully connected to ${apps.find(a => a.name_slug === appSlug)?.name}`,
    });
    // The hook will automatically update the connected apps list
  };

  const handleDisconnect = async (app: PipedreamApp) => {
    try {
      const success = await disconnectApp(app.name_slug);
      if (success) {
        toast({
          title: "Disconnected",
          description: `Disconnected from ${app.name}`,
        });
      }
    } catch (error) {
      console.error("Disconnection failed:", error);
    }
  };

  const handleManage = (app: PipedreamApp) => {
    // Open management interface for connected app
    toast({
      title: "App Management",
      description: `Opening management interface for ${app.name}`,
    });
    
    // In a real implementation, this would open the app's management dashboard
    // For now, we'll just show the connection dialog in manage mode
    setSelectedApp(app);
    setIsConnectionDialogOpen(true);
  };

  const getAuthTypeBadge = (authType: string) => {
    const colors = {
      oauth: "bg-green-100 text-green-800",
      "api-key": "bg-blue-100 text-blue-800",
      credentials: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[authType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {authType.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pipedream apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipedream Connections</h1>
          <p className="text-slate-600 mt-2">
            Connect to thousands of apps and services through Pipedream's powerful integration platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Zap className="w-3 h-3 mr-1" />
            {getConnectionCount()} Connected
          </Badge>
          <Badge variant="outline">
            {filteredApps.length} Available
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredApps.map((app) => {
          const isConnected = isAppConnected(app.name_slug);
          
          return (
            <Card key={app.name_slug} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      {app.logo_url && (
                        <img src={app.logo_url} alt={app.name} className="w-6 h-6 rounded" />
                      )}
                      {app.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {isConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      {getAuthTypeBadge(app.auth_type)}
                      {app.is_verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">✓</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {app.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-1">
                  {app.categories.slice(0, 2).map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                  {app.categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{app.categories.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {isConnected ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDisconnect(app)}
                    >
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleManage(app)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleConnect(app)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Empty State and Info Section */}
      {filteredApps.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search query or selected category.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Powered by Pipedream</h3>
            <p className="text-blue-800 text-sm mb-3">
              Pipedream provides serverless integration platform that connects APIs, databases, and more. 
              Each connection is secure, scalable, and ready to use in your automated workflows.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800">OAuth 2.0 Support</Badge>
              <Badge className="bg-blue-100 text-blue-800">API Key Management</Badge>
              <Badge className="bg-blue-100 text-blue-800">Real-time Execution</Badge>
              <Badge className="bg-blue-100 text-blue-800">Enterprise Security</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Dialog */}
      <PipedreamConnectionDialog
        app={selectedApp}
        isOpen={isConnectionDialogOpen}
        onClose={() => {
          setIsConnectionDialogOpen(false);
          setSelectedApp(null);
        }}
        onConnectionSuccess={handleConnectionSuccess}
      />
    </div>
  );
}
