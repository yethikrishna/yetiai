
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface PlatformCardProps {
  platform: Platform;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PlatformCard({ platform, onConnect, onDisconnect }: PlatformCardProps) {
  const getStatusIcon = () => {
    if (platform.isConnected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (platform.status === 'coming-soon') return <Clock className="h-4 w-4 text-yellow-600" />;
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
          <Badge className={getStatusColor()}>
            {platform.status}
          </Badge>
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
        {platform.status === 'coming-soon' ? (
          <Button disabled className="w-full">
            Coming Soon
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
