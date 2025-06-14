
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

interface TwitterOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function TwitterOAuthSection({ credentials, setCredentials }: TwitterOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Twitter OAuth 2.0 Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          You'll need your Twitter Developer App credentials. Get them from your Twitter Developer Dashboard.
        </p>
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Required Scopes:</strong> tweet.read, tweet.write, users.read, follows.read, follows.write, offline.access
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            placeholder="Your Twitter App Client ID"
            value={credentials.clientId || ''}
            onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            type="password"
            placeholder="Your Twitter App Client Secret"
            value={credentials.clientSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
