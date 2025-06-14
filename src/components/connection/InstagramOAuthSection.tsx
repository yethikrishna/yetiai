
import { CheckCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InstagramOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function InstagramOAuthSection({ credentials, setCredentials }: InstagramOAuthSectionProps) {
  return (
    <div className="space-y-4">
      {/* Requirements Info */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-800">Requirements</span>
        </div>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Instagram Business or Creator account</li>
          <li>• Account must be linked to a Facebook Page</li>
          <li>• Facebook App with Instagram Graph API access</li>
        </ul>
      </div>

      {/* App Credentials */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="appId">Facebook App ID</Label>
          <Input
            id="appId"
            placeholder="Enter your Facebook App ID"
            value={credentials.appId || ''}
            onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="appSecret">Facebook App Secret</Label>
          <Input
            id="appSecret"
            type="password"
            placeholder="Enter your Facebook App Secret"
            value={credentials.appSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
          />
        </div>
      </div>

      {/* OAuth Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Connect with OAuth</span>
        </div>
        <p className="text-sm text-blue-700">
          You'll be redirected to Instagram/Facebook to approve access. When done, Yeti will securely save your tokens.
        </p>
      </div>
    </div>
  );
}
