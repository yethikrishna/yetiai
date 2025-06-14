
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Zap } from "lucide-react";
import { isPlatformSupported } from "@/handlers/platformHandlers";

interface PlatformCardProps {
  platform: Platform;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PlatformCard({ platform, onConnect, onDisconnect }: PlatformCardProps) {
  const isSupported = isPlatformSupported(platform.id);

  const getStatusIcon = () => {
    if (platform.isConnected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (platform.status === 'coming-soon' || !isSupported) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    switch (platform.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="relative group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {platform.icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {platform.name}
                {getStatusIcon()}
              </CardTitle>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStatusColor()}>
              {platform.status}
            </Badge>
            {isSupported && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Phase 1
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <CardDescription className="text-sm">
          {platform.description}
        </CardDescription>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {platform.capabilities.map(capability => (
            <Badge key={capability} variant="outline" className="text-xs">
              {capability}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        {platform.status === 'coming-soon' && !isSupported ? (
          <Button disabled className="w-full">
            Coming Soon
          </Button>
        ) : !isSupported ? (
          <Button disabled className="w-full">
            Future Release
          </Button>
        ) : platform.isConnected ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1">
              Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={onConnect} className="w-full">
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
