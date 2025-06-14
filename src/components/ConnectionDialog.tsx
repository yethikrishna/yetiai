
import { useState } from "react";
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { isPlatformSupported } from "@/handlers/platformHandlers";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface ConnectionDialogProps {
  platform: Platform | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
}

export function ConnectionDialog({ platform, isOpen, onClose, onConnect }: ConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  if (!platform) return null;

  const isSupported = isPlatformSupported(platform.id);

  const handleConnect = async () => {
    if (!isSupported) {
      toast({
        title: "Coming Soon",
        description: `${platform.name} connection will be available in a future release.`,
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const success = await onConnect(platform.id, credentials);
      if (success) {
        toast({
          title: "Connected Successfully",
          description: `${platform.name} has been connected to Yeti.`,
        });
        onClose();
        setCredentials({});
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCredentials({});
  };

  const renderAuthFields = () => {
    if (!isSupported) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">Coming Soon</span>
            </div>
            <p className="text-sm text-amber-700">
              {platform.name} integration is currently being developed and will be available in a future release. 
              We're working on bringing you the best possible connection experience.
            </p>
          </div>
        </div>
      );
    }

    switch (platform.authType) {
      case 'api-key':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={credentials.apiKey || ''}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
            {platform.id === 'openai' && (
              <div>
                <Label htmlFor="organization">Organization ID (Optional)</Label>
                <Input
                  id="organization"
                  placeholder="org-xxxxxxxxx"
                  value={credentials.organization || ''}
                  onChange={(e) => setCredentials({ ...credentials, organization: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                placeholder="Enter username or email"
                value={credentials.username || ''}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password || ''}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            {platform.id === 'wordpress' && (
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  placeholder="https://yoursite.com"
                  value={credentials.siteUrl || ''}
                  onChange={(e) => setCredentials({ ...credentials, siteUrl: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'oauth':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Secure OAuth Connection</span>
              </div>
              <p className="text-sm text-blue-700">
                You'll be redirected to {platform.name} to authorize the connection.
                This is the secure way to connect without sharing your password.
              </p>
            </div>
            <div>
              <Label htmlFor="customConfig">Custom Configuration (Optional)</Label>
              <Textarea
                id="customConfig"
                placeholder="Any additional configuration in JSON format"
                value={credentials.customConfig || ''}
                onChange={(e) => setCredentials({ ...credentials, customConfig: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platform.icon}
            Connect to {platform.name}
            {isSupported && (
              <Badge className="bg-green-100 text-green-800">
                Phase 1
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {platform.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderAuthFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {isSupported ? (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          ) : (
            <Button disabled>
              Coming Soon
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
