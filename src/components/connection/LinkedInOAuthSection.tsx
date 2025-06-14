
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedInOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function LinkedInOAuthSection({ credentials, setCredentials }: LinkedInOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">LinkedIn Developer Setup Required</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          You need to create a LinkedIn app to get your Client ID and Client Secret.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.linkedin.com/developers/apps', '_blank')}
          className="text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Create LinkedIn App
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            placeholder="Enter your LinkedIn Client ID"
            value={credentials.clientId || ''}
            onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            type="password"
            placeholder="Enter your LinkedIn Client Secret"
            value={credentials.clientSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Required Permissions:</strong> r_liteprofile, r_emailaddress, w_member_social
          <br />
          <strong>Redirect URI:</strong> {window.location.origin}/auth/linkedin/callback
        </p>
      </div>
    </div>
  );
}
