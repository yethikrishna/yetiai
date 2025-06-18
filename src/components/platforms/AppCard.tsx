
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, Zap, Settings } from 'lucide-react';

export interface PipedreamApp {
  name: string;
  name_slug: string;
  auth_type?: string;
  categories?: string[];
  description?: string;
  logo_url?: string;
}

interface AppCardProps {
  app: PipedreamApp;
  isConnected: boolean;
  onConnect: () => void;
  isConnecting: boolean;
  viewMode: 'grid' | 'list';
}

export function AppCard({ app, isConnected, onConnect, isConnecting, viewMode }: AppCardProps) {
  const getAuthTypeBadge = (authType?: string) => {
    if (!authType) return null;
    
    const variants: Record<string, { variant: any, label: string }> = {
      'oauth': { variant: 'default', label: 'OAuth' },
      'api_key': { variant: 'secondary', label: 'API Key' },
      'webhook': { variant: 'outline', label: 'Webhook' },
      'none': { variant: 'outline', label: 'No Auth' }
    };
    
    const config = variants[authType.toLowerCase()] || { variant: 'outline', label: authType };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadges = (categories?: string[]) => {
    if (!categories || categories.length === 0) return null;
    
    return categories.slice(0, 2).map((category, index) => (
      <Badge key={index} variant="outline" className="text-xs">
        {category}
      </Badge>
    ));
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* App Icon/Logo */}
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {app.logo_url ? (
                  <img 
                    src={app.logo_url} 
                    alt={app.name} 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 bg-blue-100 rounded flex items-center justify-center ${app.logo_url ? 'hidden' : ''}`}>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </div>

              {/* App Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
                  {isConnected && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                  {app.description || `Connect to ${app.name} to automate your workflows.`}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {getAuthTypeBadge(app.auth_type)}
                  {getCategoryBadges(app.categories)}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {isConnected ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={onConnect} 
                  disabled={isConnecting}
                  size="sm"
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* App Icon/Logo */}
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              {app.logo_url ? (
                <img 
                  src={app.logo_url} 
                  alt={app.name} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-6 h-6 bg-blue-100 rounded flex items-center justify-center ${app.logo_url ? 'hidden' : ''}`}>
                <Zap className="h-3 w-3 text-blue-600" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm flex items-center gap-2 truncate">
                <span className="truncate">{app.name}</span>
                {isConnected && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
              </CardTitle>
            </div>
          </div>
          
          {getAuthTypeBadge(app.auth_type)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <CardDescription className="text-xs line-clamp-3 mb-3">
          {app.description || `Connect to ${app.name} to automate your workflows and integrate with your existing tools.`}
        </CardDescription>
        
        {/* Categories */}
        {app.categories && app.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {getCategoryBadges(app.categories)}
            {app.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{app.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        {isConnected ? (
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onConnect} 
            disabled={isConnecting}
            className="w-full text-xs h-8"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
