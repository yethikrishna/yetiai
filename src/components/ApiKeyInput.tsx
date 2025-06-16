
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, ExternalLink, Check } from 'lucide-react';
import { aiService } from '@/lib/ai/aiService';

interface ApiKeyInputProps {
  onApiKeySet: (provider: string, apiKey: string) => void;
  currentApiKeys?: { groq?: string; openrouter?: string };
}

export function ApiKeyInput({ onApiKeySet, currentApiKeys }: ApiKeyInputProps) {
  const [groqApiKey, setGroqApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [isUpdatingGroq, setIsUpdatingGroq] = useState(!currentApiKeys?.groq);
  const [isUpdatingOpenRouter, setIsUpdatingOpenRouter] = useState(!currentApiKeys?.openrouter);

  const handleGroqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groqApiKey.trim()) {
      onApiKeySet('groq', groqApiKey.trim());
      aiService.setGroqApiKey(groqApiKey.trim());
      setIsUpdatingGroq(false);
      setGroqApiKey('');
    }
  };

  const handleOpenRouterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openRouterApiKey.trim()) {
      onApiKeySet('openrouter', openRouterApiKey.trim());
      aiService.setOpenRouterApiKey(openRouterApiKey.trim());
      setIsUpdatingOpenRouter(false);
      setOpenRouterApiKey('');
    }
  };

  const providerStatus = aiService.getProviderStatus();

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧊 Configure AI Providers
        </CardTitle>
        <CardDescription>
          Set up your AI providers to enable Yeti's intelligent responses. Multiple providers provide better reliability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="groq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groq" className="flex items-center gap-2">
              Groq {providerStatus.Groq && <Check size={14} className="text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="openrouter" className="flex items-center gap-2">
              OpenRouter {providerStatus.OpenRouter && <Check size={14} className="text-green-500" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groq" className="space-y-4">
            {currentApiKeys?.groq && !isUpdatingGroq ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Groq API key is configured and ready
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdatingGroq(true)}
                  className="w-full"
                >
                  Update Groq API Key
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGroqSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groq-api-key">Groq API Key</Label>
                  <div className="relative">
                    <Input
                      id="groq-api-key"
                      type={showGroqKey ? "text" : "password"}
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                    >
                      {showGroqKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={!groqApiKey.trim()}>
                  Set Groq API Key
                </Button>
                
                {isUpdatingGroq && currentApiKeys?.groq && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsUpdatingGroq(false)}
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
                    Get free Groq API key <ExternalLink size={12} />
                  </a>
                </div>
              </form>
            )}
          </TabsContent>
          
          <TabsContent value="openrouter" className="space-y-4">
            {currentApiKeys?.openrouter && !isUpdatingOpenRouter ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ OpenRouter API key is configured and ready
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdatingOpenRouter(true)}
                  className="w-full"
                >
                  Update OpenRouter API Key
                </Button>
              </div>
            ) : (
              <form onSubmit={handleOpenRouterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                  <div className="relative">
                    <Input
                      id="openrouter-api-key"
                      type={showOpenRouterKey ? "text" : "password"}
                      value={openRouterApiKey}
                      onChange={(e) => setOpenRouterApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    >
                      {showOpenRouterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={!openRouterApiKey.trim()}>
                  Set OpenRouter API Key
                </Button>
                
                {isUpdatingOpenRouter && currentApiKeys?.openrouter && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsUpdatingOpenRouter(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
                
                <div className="text-center">
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Get OpenRouter API key <ExternalLink size={12} />
                  </a>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Having multiple AI providers enables automatic fallback for better reliability
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
