
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Cpu, Zap, Globe, Shield } from 'lucide-react';
import { aiService } from '@/lib/ai/aiService';
import { useToast } from '@/hooks/use-toast';

export const ModelConfigPanel = () => {
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    perplexity: '',
    mistral: '',
    ollama: 'http://localhost:11434'
  });
  const [providerStatus, setProviderStatus] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    // Load existing API keys from localStorage
    setApiKeys({
      claude: localStorage.getItem('claude-api-key') || '',
      perplexity: localStorage.getItem('perplexity-api-key') || '',
      mistral: localStorage.getItem('mistral-api-key') || '',
      ollama: localStorage.getItem('ollama-base-url') || 'http://localhost:11434'
    });

    // Get provider status
    setProviderStatus(aiService.getProviderStatus());
  }, []);

  const handleSaveApiKey = (provider: string, value: string) => {
    switch (provider) {
      case 'claude':
        aiService.setClaudeApiKey(value);
        break;
      case 'perplexity':
        aiService.setPerplexityApiKey(value);
        break;
      case 'mistral':
        aiService.setMistralApiKey(value);
        break;
      case 'ollama':
        localStorage.setItem('ollama-base-url', value);
        break;
    }

    setApiKeys(prev => ({ ...prev, [provider]: value }));
    setProviderStatus(aiService.getProviderStatus());
    
    toast({
      title: "Configuration Updated",
      description: `${provider} has been configured successfully.`,
    });
  };

  const modelConfigs = [
    {
      name: 'Claude-3.5',
      provider: 'claude',
      description: 'Advanced reasoning and analysis',
      icon: <Cpu className="w-5 h-5" />,
      specialty: 'Reasoning',
      color: 'bg-orange-500'
    },
    {
      name: 'Perplexity',
      provider: 'perplexity',
      description: 'Real-time research and web search',
      icon: <Globe className="w-5 h-5" />,
      specialty: 'Research',
      color: 'bg-blue-500'
    },
    {
      name: 'Mistral',
      provider: 'mistral',
      description: 'Multilingual and creative tasks',
      icon: <Zap className="w-5 h-5" />,
      specialty: 'Creative',
      color: 'bg-purple-500'
    },
    {
      name: 'Ollama',
      provider: 'ollama',
      description: 'Local privacy-focused models',
      icon: <Shield className="w-5 h-5" />,
      specialty: 'Privacy',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">AI Model Configuration</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modelConfigs.map((config) => (
          <Card key={config.provider} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${config.color} p-2 rounded-lg text-white`}>
                    {config.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {config.specialty}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      providerStatus[config.name] ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    {providerStatus[config.name] ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{config.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor={`${config.provider}-key`}>
                  {config.provider === 'ollama' ? 'Base URL' : 'API Key'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`${config.provider}-key`}
                    type={config.provider === 'ollama' ? 'url' : 'password'}
                    placeholder={
                      config.provider === 'ollama' 
                        ? 'http://localhost:11434' 
                        : `Enter ${config.name} API key`
                    }
                    value={apiKeys[config.provider as keyof typeof apiKeys]}
                    onChange={(e) => setApiKeys(prev => ({ 
                      ...prev, 
                      [config.provider]: e.target.value 
                    }))}
                  />
                  <Button
                    onClick={() => handleSaveApiKey(
                      config.provider, 
                      apiKeys[config.provider as keyof typeof apiKeys]
                    )}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Active Model Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(providerStatus).map(([provider, isActive]) => (
              <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{provider}</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? 'Ready' : 'Offline'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
