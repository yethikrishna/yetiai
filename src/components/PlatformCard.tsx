
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
    if (platform.isConnected) return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
    if (platform.status === 'coming-soon' || !isSupported) return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />;
    return <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
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
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5">
                {platform.icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-1 sm:gap-2 truncate">
                <span className="truncate">{platform.name}</span>
                {getStatusIcon()}
              </CardTitle>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Badge className={`${getStatusColor()} text-xs`}>
              {platform.status}
            </Badge>
            {isSupported && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Zap className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                Phase 1
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 sm:pb-3">
        <CardDescription className="text-xs sm:text-sm line-clamp-2">
          {platform.description}
        </CardDescription>
        
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
          {platform.capabilities.slice(0, 3).map(capability => (
            <Badge key={capability} variant="outline" className="text-xs">
              {capability}
            </Badge>
          ))}
          {platform.capabilities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{platform.capabilities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        {platform.status === 'coming-soon' && !isSupported ? (
          <Button disabled className="w-full text-xs sm:text-sm h-8 sm:h-9">
            Coming Soon
          </Button>
        ) : !isSupported ? (
          <Button disabled className="w-full text-xs sm:text-sm h-8 sm:h-9">
            Future Release
          </Button>
        ) : platform.isConnected ? (
          <div className="flex gap-1 sm:gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
              Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1 text-xs h-8"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={onConnect} className="w-full text-xs sm:text-sm h-8 sm:h-9">
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
