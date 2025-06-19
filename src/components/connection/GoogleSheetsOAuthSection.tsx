import { Button } from "@/components/ui/button";
import { ExternalLink, FileSpreadsheet, Shield } from "lucide-react";

interface GoogleSheetsOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function GoogleSheetsOAuthSection({ credentials, setCredentials }: GoogleSheetsOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800">Google Sheets OAuth Setup</span>
        </div>
        <p className="text-sm text-green-700 mb-3">
          Connect your Google Sheets account to enable spreadsheet reading, writing, and management capabilities.
        </p>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Shield className="h-3 w-3" />
          <span>Secure OAuth 2.0 authentication</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Google Sheets MCP Capabilities:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Read and search spreadsheet data</li>
            <li>• Create new spreadsheets</li>
            <li>• Update cell values and formulas</li>
            <li>• Manage sheets and ranges</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          <p className="mb-1">Required OAuth scopes:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>spreadsheets - Full access to Google Sheets</li>
            <li>profile - Access to your basic profile info</li>
            <li>email - View your email address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
