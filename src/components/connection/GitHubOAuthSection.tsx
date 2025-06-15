
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Key } from "lucide-react";

interface GitHubOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function GitHubOAuthSection({ credentials, setCredentials }: GitHubOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Personal Access Token Required</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Create a Personal Access Token from your GitHub settings to connect your account securely.
        </p>
        <a 
          href="https://github.com/settings/tokens" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Create a Personal Access Token <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="github-token">Personal Access Token</Label>
        <Input
          id="github-token"
          type="password"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={credentials.token || ''}
          onChange={(e) => setCredentials({ ...credentials, token: e.target.value })}
        />
        <p className="text-xs text-gray-600">
          Required scopes: repo, user, admin:repo_hook (for full functionality)
        </p>
      </div>
    </div>
  );
}
