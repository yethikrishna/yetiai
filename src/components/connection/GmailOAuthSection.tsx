
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Shield } from "lucide-react";

interface GmailOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function GmailOAuthSection({ credentials, setCredentials }: GmailOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Gmail OAuth Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Connect your Gmail account to enable email reading, writing, and searching capabilities.
        </p>
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Shield className="h-3 w-3" />
          <span>Secure OAuth 2.0 authentication</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Gmail MCP Capabilities:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Read and search emails</li>
            <li>• Send new emails</li>
            <li>• Access email metadata and content</li>
            <li>• Full Gmail API integration</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          <p className="mb-1">Required OAuth scopes:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>gmail.readonly - Read emails</li>
            <li>gmail.send - Send emails</li>
            <li>gmail.modify - Modify emails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
