
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

interface FacebookOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function FacebookOAuthSection({ credentials, setCredentials }: FacebookOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Facebook OAuth 2.0 Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          You'll need your Facebook App credentials from your Facebook Developer Dashboard.
        </p>
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Required Permissions:</strong> pages_manage_posts, pages_read_engagement, pages_show_list, pages_read_user_content, publish_to_groups
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="appId">App ID</Label>
          <Input
            id="appId"
            placeholder="Your Facebook App ID"
            value={credentials.appId || ''}
            onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="appSecret">App Secret</Label>
          <Input
            id="appSecret"
            type="password"
            placeholder="Your Facebook App Secret"
            value={credentials.appSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
