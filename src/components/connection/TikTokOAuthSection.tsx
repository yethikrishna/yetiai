
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Info } from "lucide-react";

interface TikTokOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function TikTokOAuthSection({ credentials, setCredentials }: TikTokOAuthSectionProps) {
  const handleInputChange = (field: string, value: string) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You'll need to create a TikTok app and get your Client ID and Client Secret.{" "}
          <a 
            href="https://developers.tiktok.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            TikTok for Developers
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <Label htmlFor="tiktok-client-id">Client ID</Label>
          <Input
            id="tiktok-client-id"
            type="text"
            placeholder="Enter your TikTok Client ID"
            value={credentials.clientId || ""}
            onChange={(e) => handleInputChange("clientId", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tiktok-client-secret">Client Secret</Label>
          <Input
            id="tiktok-client-secret"
            type="password"
            placeholder="Enter your TikTok Client Secret"
            value={credentials.clientSecret || ""}
            onChange={(e) => handleInputChange("clientSecret", e.target.value)}
          />
        </div>
      </div>

      <Alert>
        <AlertDescription className="text-xs text-gray-600">
          Make sure your TikTok app has the following scopes enabled: user.info.basic, video.list, video.upload, video.publish
        </AlertDescription>
      </Alert>
    </div>
  );
}
