
import { useState } from "react";
import { PipedreamApp } from "@/types/pipedream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, Settings, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePipedreamMcp } from "@/hooks/usePipedreamMcp";

interface PipedreamConnectionDialogProps {
  app: PipedreamApp | null;
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess: (appSlug: string) => void;
}

export function PipedreamConnectionDialog({ app, isOpen, onClose, onConnectionSuccess }: PipedreamConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("connect");
  const { connectApp, isLoading } = usePipedreamMcp();
  const { toast } = useToast();

  if (!app) return null;

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleConnect = async () => {
    try {
      const success = await connectApp(app.name_slug, credentials);
      if (success) {
        onConnectionSuccess(app.name_slug);
        onClose();
        setCredentials({});
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleOAuthConnect = () => {
    // In a real implementation, this would open OAuth flow
    const oauthUrl = `https://pipedream.com/connect/${app.name_slug}?redirect_uri=${encodeURIComponent(window.location.origin)}/oauth/callback`;
    
    toast({
      title: "OAuth Flow",
      description: "Opening OAuth authorization window...",
    });

    // Simulate OAuth flow
    window.open(oauthUrl, 'oauth', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    // For demo purposes, we'll simulate successful OAuth after a delay
    setTimeout(() => {
      const mockOAuthCredentials = {
        access_token: `oauth_token_${Date.now()}`,
        refresh_token: `refresh_token_${Date.now()}`,
        expires_in: "3600",
        scope: "read,write",
        token_type: "Bearer"
      };
      
      connectApp(app.name_slug, mockOAuthCredentials).then((success) => {
        if (success) {
          onConnectionSuccess(app.name_slug);
          onClose();
        }
      });
    }, 2000);
  };

  const getConnectionFields = () => {
    switch (app.auth_type) {
      case 'oauth':
        return (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This app uses OAuth for secure authentication. Click the button below to authorize Yeti AI to access your {app.name} account.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleOAuthConnect} 
              className="w-full" 
              disabled={isLoading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isLoading ? "Connecting..." : `Connect with ${app.name}`}
            </Button>
          </div>
        );
      
      case 'api-key':
        return (
          <div className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                This app requires an API key for authentication. You can find your API key in your {app.name} account settings.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter your API key"
                value={credentials.api_key || ''}
                onChange={(e) => handleCredentialChange('api_key', e.target.value)}
              />
            </div>
            {app.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Key
                </a>
              </Button>
            )}
          </div>
        );
      
      case 'credentials':
        return (
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                This app requires username/password or custom credentials for authentication.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={credentials.username || ''}
                onChange={(e) => handleCredentialChange('username', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password || ''}
                onChange={(e) => handleCredentialChange('password', e.target.value)}
              />
            </div>
            {app.custom_fields_json && (
              <div className="text-sm text-gray-600">
                Additional fields may be required based on the app's configuration.
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Connection method not yet supported for this app.</p>
          </div>
        );
    }
  };

  const canConnect = () => {
    switch (app.auth_type) {
      case 'oauth':
        return true;
      case 'api-key':
        return credentials.api_key?.trim();
      case 'credentials':
        return credentials.username?.trim() && credentials.password?.trim();
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {app.logo_url && (
              <img src={app.logo_url} alt={app.name} className="w-8 h-8 rounded" />
            )}
            <div>
              <div className="flex items-center gap-2">
                {app.name}
                {app.is_verified && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                )}
              </div>
              <div className="text-sm font-normal text-gray-600">
                {app.auth_type.toUpperCase()} Authentication
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {app.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="info">App Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-4 mt-4">
            {getConnectionFields()}
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Categories</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {app.categories.map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {app.website_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Website</h4>
                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {app.website_url}
                    </a>
                  </Button>
                </div>
              )}
              
              {app.documentation_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Documentation</h4>
                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <a href={app.documentation_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Documentation
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === "connect" && (
            <Button 
              onClick={app.auth_type === 'oauth' ? handleOAuthConnect : handleConnect}
              disabled={!canConnect() || isLoading}
            >
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
