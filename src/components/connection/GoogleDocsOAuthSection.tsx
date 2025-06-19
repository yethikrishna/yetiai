import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Shield } from "lucide-react";

interface GoogleDocsOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function GoogleDocsOAuthSection({ credentials, setCredentials }: GoogleDocsOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Google Docs OAuth Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Connect your Google Docs account to enable document creation, editing, and management capabilities.
        </p>
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Shield className="h-3 w-3" />
          <span>Secure OAuth 2.0 authentication</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Google Docs MCP Capabilities:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Create and edit documents</li>
            <li>• Read document content</li>
            <li>• Insert and replace text</li>
            <li>• Export documents as text</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          <p className="mb-1">Required OAuth scopes:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>documents - Full access to Google Docs</li>
            <li>profile - Access to your basic profile info</li>
            <li>email - View your email address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
