
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ExternalLink, Check } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

export function ApiKeyInput({ onApiKeySet, currentApiKey }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(!currentApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      localStorage.setItem('groq-api-key', apiKey.trim());
      setIsUpdating(false);
      setApiKey('');
    }
  };

  // If we have a current key and not updating, show the status
  if (currentApiKey && !isUpdating) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="text-green-500" size={20} />
            🧊 API Key Configured
          </CardTitle>
          <CardDescription>
            Your Groq API key is set and ready to use. Yeti can now provide AI-powered responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ API key is securely stored and hidden for your privacy
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsUpdating(true)}
              className="w-full"
            >
              Update API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧊 {currentApiKey ? 'Update' : 'Enable'} AI Chat
        </CardTitle>
        <CardDescription>
          Enter your Groq API key to enable real AI conversations with Yeti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Groq API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
            {currentApiKey ? 'Update' : 'Set'} API Key
          </Button>
          
          {isUpdating && currentApiKey && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsUpdating(false)}
              className="w-full"
            >
              Cancel
            </Button>
          )}
          
          <div className="text-center">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Get free API key from Groq <ExternalLink size={12} />
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
