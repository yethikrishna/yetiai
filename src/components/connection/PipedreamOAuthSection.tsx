
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, ExternalLink, Search } from "lucide-react";

interface PipedreamOAuthSectionProps {
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

const POPULAR_APPS = [
  { id: 'google_sheets', name: 'Google Sheets', category: 'productivity' },
  { id: 'slack', name: 'Slack', category: 'communication' },
  { id: 'airtable', name: 'Airtable', category: 'database' },
  { id: 'notion', name: 'Notion', category: 'productivity' },
  { id: 'github', name: 'GitHub', category: 'development' },
  { id: 'discord', name: 'Discord', category: 'communication' },
  { id: 'gmail', name: 'Gmail', category: 'email' },
  { id: 'stripe', name: 'Stripe', category: 'payment' },
  { id: 'shopify', name: 'Shopify', category: 'ecommerce' },
  { id: 'hubspot', name: 'HubSpot', category: 'crm' },
  { id: 'salesforce', name: 'Salesforce', category: 'crm' },
  { id: 'twitter', name: 'Twitter/X', category: 'social' },
  { id: 'facebook', name: 'Facebook', category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', category: 'social' },
  { id: 'instagram', name: 'Instagram', category: 'social' },
  { id: 'youtube', name: 'YouTube', category: 'media' },
  { id: 'tiktok', name: 'TikTok', category: 'social' },
  { id: 'zoom', name: 'Zoom', category: 'communication' },
  { id: 'microsoft_teams', name: 'Microsoft Teams', category: 'communication' },
  { id: 'trello', name: 'Trello', category: 'productivity' },
  { id: 'asana', name: 'Asana', category: 'productivity' },
  { id: 'jira', name: 'Jira', category: 'development' },
  { id: 'confluence', name: 'Confluence', category: 'documentation' },
  { id: 'dropbox', name: 'Dropbox', category: 'storage' },
  { id: 'google_drive', name: 'Google Drive', category: 'storage' },
  { id: 'onedrive', name: 'OneDrive', category: 'storage' },
  { id: 'aws_s3', name: 'AWS S3', category: 'storage' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'email' },
  { id: 'sendgrid', name: 'SendGrid', category: 'email' },
  { id: 'twilio', name: 'Twilio', category: 'communication' },
  { id: 'calendly', name: 'Calendly', category: 'scheduling' },
  { id: 'typeform', name: 'Typeform', category: 'forms' },
  { id: 'zapier', name: 'Zapier', category: 'automation' },
  { id: 'webhooks', name: 'Webhooks', category: 'integration' },
  { id: 'http', name: 'HTTP/REST API', category: 'integration' },
  { id: 'openai', name: 'OpenAI', category: 'ai' },
  { id: 'anthropic', name: 'Anthropic', category: 'ai' },
  { id: 'google_calendar', name: 'Google Calendar', category: 'scheduling' },
  { id: 'outlook', name: 'Outlook', category: 'email' },
  { id: 'figma', name: 'Figma', category: 'design' },
  { id: 'canva', name: 'Canva', category: 'design' },
  { id: 'wordpress', name: 'WordPress', category: 'cms' },
  { id: 'woocommerce', name: 'WooCommerce', category: 'ecommerce' },
  { id: 'square', name: 'Square', category: 'payment' },
  { id: 'paypal', name: 'PayPal', category: 'payment' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'accounting' },
  { id: 'xero', name: 'Xero', category: 'accounting' },
  { id: 'freshdesk', name: 'Freshdesk', category: 'support' },
  { id: 'zendesk', name: 'Zendesk', category: 'support' },
  { id: 'intercom', name: 'Intercom', category: 'support' }
];

const CATEGORIES = [
  'all', 'productivity', 'communication', 'social', 'email', 'storage', 
  'development', 'crm', 'ecommerce', 'payment', 'ai', 'automation'
];

export function PipedreamOAuthSection({ credentials, setCredentials }: PipedreamOAuthSectionProps) {
  const [selectedApp, setSelectedApp] = useState(credentials.app || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleAppSelect = (appId: string) => {
    setSelectedApp(appId);
    setCredentials({ ...credentials, app: appId });
  };

  const filteredApps = POPULAR_APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">Pipedream Connect</span>
          <Badge variant="secondary" className="text-xs">2500+ Apps</Badge>
        </div>
        <p className="text-sm text-orange-700">
          Connect to any of 2500+ apps and services. Select a specific app or choose "All Apps" for maximum flexibility.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Connection Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedApp === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAppSelect('')}
            className="justify-start"
          >
            <CheckCircle className="h-3 w-3 mr-2" />
            All Apps (Flexible)
          </Button>
          <Button
            variant={selectedApp !== '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {}}
            className="justify-start"
            disabled
          >
            Specific App
          </Button>
        </div>
      </div>

      {selectedApp === '' ? (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Flexible Connection:</strong> Connect once, use with any of the 2500+ supported apps. 
            You can connect to multiple apps later through the Pipedream dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Search & Filter Apps</Label>
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="max-h-40 overflow-y-auto border rounded-lg">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className={`p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                  selectedApp === app.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleAppSelect(app.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{app.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {app.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No apps found. Try adjusting your search or category filter.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">OAuth Secure</Badge>
        <Badge variant="secondary" className="text-xs">Real-time Sync</Badge>
        <Badge variant="secondary" className="text-xs">API Actions</Badge>
        <Badge variant="secondary" className="text-xs">Webhooks</Badge>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p>• Secure authentication with industry-standard OAuth</p>
        <p>• Access to read, write, and execute operations</p>
        <p>• Real-time data synchronization and webhooks</p>
        <p>• Serverless code execution for custom logic</p>
      </div>

      <div className="pt-2">
        <a 
          href="https://pipedream.com/apps" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          Browse all 2500+ apps on Pipedream
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
