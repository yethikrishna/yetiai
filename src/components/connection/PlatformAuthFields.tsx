
import { Platform } from "@/types/platform";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

interface PlatformAuthFieldsProps {
  platform: Platform;
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function PlatformAuthFields({ platform, credentials, setCredentials }: PlatformAuthFieldsProps) {
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
}
