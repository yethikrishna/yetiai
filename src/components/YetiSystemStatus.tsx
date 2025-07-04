import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked?: Date;
  responseTime?: number;
  error?: string;
}

export function YetiSystemStatus() {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    { name: 'OpenAI GPT-4o', status: 'checking' },
    { name: 'OpenRouter Claude', status: 'checking' },
    { name: 'Gemini Flash', status: 'checking' },
    { name: 'Novita Llama', status: 'checking' },
    { name: 'A4F Image Gen', status: 'checking' },
    { name: 'A4F Video Gen', status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkProviderStatus = async () => {
    setIsChecking(true);
    
    const statusChecks = [
      {
        name: 'OpenAI GPT-4o',
        test: () => supabase.functions.invoke('yeti-ai-chat', {
          body: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 10
          }
        })
      },
      {
        name: 'OpenRouter Claude',
        test: () => supabase.functions.invoke('yeti-ai-chat', {
          body: {
            provider: 'openrouter',
            model: 'anthropic/claude-3.5-sonnet',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 10
          }
        })
      },
      {
        name: 'Gemini Flash',
        test: () => supabase.functions.invoke('yeti-ai-chat', {
          body: {
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 10
          }
        })
      },
      {
        name: 'Novita Llama',
        test: () => supabase.functions.invoke('yeti-ai-chat', {
          body: {
            provider: 'novita',
            model: 'meta-llama/llama-3.1-8b-instruct',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 10
          }
        })
      },
      {
        name: 'A4F Image Gen',
        test: () => supabase.functions.invoke('yeti-image-generation', {
          body: {
            provider: 'a4f',
            model: 'flux-1-schnell',
            prompt: 'test',
            width: 512,
            height: 512
          }
        })
      },
      {
        name: 'A4F Video Gen',
        test: () => supabase.functions.invoke('yeti-video-generation', {
          body: {
            provider: 'a4f',
            model: 'minimax-video-01',
            prompt: 'test',
            duration: 2
          }
        })
      }
    ];

    const results = await Promise.allSettled(
      statusChecks.map(async (check) => {
        const startTime = Date.now();
        try {
          const { data, error } = await check.test();
          const responseTime = Date.now() - startTime;
          
          if (error) throw error;
          
          return {
            name: check.name,
            status: 'online' as const,
            lastChecked: new Date(),
            responseTime,
            error: undefined
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            name: check.name,
            status: 'offline' as const,
            lastChecked: new Date(),
            responseTime,
            error: error.message || 'Unknown error'
          };
        }
      })
    );

    const newProviders = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: statusChecks[index].name,
          status: 'offline' as const,
          lastChecked: new Date(),
          error: 'System error'
        };
      }
    });

    setProviders(newProviders);
    setIsChecking(false);

    const onlineCount = newProviders.filter(p => p.status === 'online').length;
    toast({
      title: "🧊 System Status Check",
      description: `${onlineCount}/${newProviders.length} providers online`,
      variant: onlineCount > 0 ? "default" : "destructive"
    });
  };

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (provider: ProviderStatus) => {
    const variant = provider.status === 'online' ? 'default' : 
                   provider.status === 'offline' ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant} className="text-xs">
        {provider.status}
        {provider.responseTime && provider.status === 'online' && (
          <span className="ml-1">({provider.responseTime}ms)</span>
        )}
      </Badge>
    );
  };

  const onlineProviders = providers.filter(p => p.status === 'online').length;
  const totalProviders = providers.length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            🧊 Yeti AI System Status
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkProviderStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={onlineProviders > 0 ? 'default' : 'destructive'}>
            {onlineProviders}/{totalProviders} providers online
          </Badge>
          {onlineProviders > 0 && (
            <Badge variant="outline" className="text-green-600">
              ✅ Fallback system active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.map((provider) => (
            <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(provider.status)}
                <div>
                  <div className="font-medium">{provider.name}</div>
                  {provider.error && (
                    <div className="text-xs text-red-600">{provider.error}</div>
                  )}
                  {provider.lastChecked && (
                    <div className="text-xs text-gray-500">
                      Last checked: {provider.lastChecked.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(provider)}
            </div>
          ))}
        </div>
        
        {onlineProviders === 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium mb-2">⚠️ All providers offline</div>
            <div className="text-red-600 text-sm">
              Please check your API keys in Supabase secrets and ensure all providers are properly configured.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}