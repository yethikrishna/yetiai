
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, AlertTriangle } from "lucide-react";

interface ShareChatOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function ShareChatOAuthSection({ credentials, setCredentials }: ShareChatOAuthSectionProps) {
  const handleInputChange = (field: string, value: string) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Unofficial Integration:</strong> ShareChat doesn't provide a public API. This integration uses reverse-engineered endpoints and may break if ShareChat updates their system.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <Label htmlFor="sharechat-phone">Phone Number</Label>
          <Input
            id="sharechat-phone"
            type="tel"
            placeholder="Enter your ShareChat phone number"
            value={credentials.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="sharechat-password">Password</Label>
          <Input
            id="sharechat-password"
            type="password"
            placeholder="Enter your ShareChat password"
            value={credentials.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your credentials are used to create a secure session and are not stored permanently. The integration handles authentication tokens securely.
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs text-gray-600">
          <strong>Important:</strong> This integration may violate ShareChat's terms of service. Use at your own discretion and ensure compliance with their policies.
        </AlertDescription>
      </Alert>
    </div>
  );
}
