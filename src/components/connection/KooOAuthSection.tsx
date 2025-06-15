
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield } from "lucide-react";

interface KooOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function KooOAuthSection({ credentials, setCredentials }: KooOAuthSectionProps) {
  const handleInputChange = (field: string, value: string) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Koo uses session-based authentication. Your credentials are used to create a secure session and are not stored permanently.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <Label htmlFor="koo-email">Email</Label>
          <Input
            id="koo-email"
            type="email"
            placeholder="Enter your Koo email"
            value={credentials.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="koo-password">Password</Label>
          <Input
            id="koo-password"
            type="password"
            placeholder="Enter your Koo password"
            value={credentials.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs text-gray-600">
          This integration uses Koo's unofficial API. Make sure to use a strong, unique password for your Koo account.
        </AlertDescription>
      </Alert>
    </div>
  );
}
