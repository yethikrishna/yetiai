
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ExternalLink } from "lucide-react";

interface PipedreamOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

const POPULAR_APPS = [
  { id: 'google_sheets', name: 'Google Sheets' },
  { id: 'slack', name: 'Slack' },
  { id: 'airtable', name: 'Airtable' },
  { id: 'notion', name: 'Notion' },
  { id: 'github', name: 'GitHub' },
  { id: 'discord', name: 'Discord' },
  { id: 'gmail', name: 'Gmail' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'shopify', name: 'Shopify' },
  { id: 'hubspot', name: 'HubSpot' }
];

export function PipedreamOAuthSection({ credentials, setCredentials }: PipedreamOAuthSectionProps) {
  const [selectedApp, setSelectedApp] = useState(credentials.app || '');

  const handleAppSelect = (appId: string) => {
    setSelectedApp(appId);
    setCredentials({ ...credentials, app: appId });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">Pipedream Connect</span>
        </div>
        <p className="text-sm text-orange-700">
          Pipedream provides access to 2500+ APIs and services. Select an app to connect or choose "All Apps" for flexible integration.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="app-select">Choose an app to connect (optional)</Label>
        <Select value={selectedApp} onValueChange={handleAppSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select an app or leave blank for all apps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Apps (Flexible Connection)</SelectItem>
            {POPULAR_APPS.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          2500+ APIs
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Serverless Code
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Visual Workflows
        </Badge>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p>• Connect once, use everywhere in your workflows</p>
        <p>• Secure OAuth authentication</p>
        <p>• Real-time data synchronization</p>
      </div>

      <div className="pt-2">
        <a 
          href="https://pipedream.com/apps" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          Browse all available apps
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
