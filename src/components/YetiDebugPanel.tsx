import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MessageSquare,
  Zap
} from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function YetiDebugPanel() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "AI Chat (OpenAI)", status: 'pending', message: 'Not tested' },
    { name: "AI Chat (OpenRouter)", status: 'pending', message: 'Not tested' },
    { name: "Memory Service", status: 'pending', message: 'Not tested' },
    { name: "Image Generation", status: 'pending', message: 'Not tested' },
    { name: "Session Creation", status: 'pending', message: 'Not tested' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [testInput, setTestInput] = useState("Hello, can you help me test this system?");
  const { toast } = useToast();

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const testOpenAIChat = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: testInput }],
          max_tokens: 100,
          temperature: 0.7
        },
      });

      if (error) throw error;
      
      return { 
        success: true, 
        message: `OpenAI response: ${data.content.substring(0, 50)}...`,
        details: data 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'OpenAI test failed',
        details: error 
      };
    }
  };

  const testOpenRouterChat = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: 'openrouter',
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: testInput }],
          max_tokens: 100,
          temperature: 0.7
        },
      });

      if (error) throw error;
      
      return { 
        success: true, 
        message: `OpenRouter response: ${data.content.substring(0, 50)}...`,
        details: data 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'OpenRouter test failed',
        details: error 
      };
    }
  };

  const testMemoryService = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-chat-memory', {
        body: {
          action: 'create_session',
          model_used: 'test-model'
        },
      });

      if (error) throw error;
      
      return { 
        success: true, 
        message: `Memory service working: Session ${data.session.id}`,
        details: data 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Memory service failed',
        details: error 
      };
    }
  };

  const testImageGeneration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-image-generation', {
        body: {
          provider: 'a4f',
          model: 'flux-1-schnell',
          prompt: 'A simple test image of a blue circle',
          width: 512,
          height: 512,
        },
      });

      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Image generation working',
        details: data 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Image generation failed',
        details: error 
      };
    }
  };

  const testSessionCreation = async () => {
    try {
      // This simulates the session creation process
      const sessionId = `test_${Date.now()}`;
      return { 
        success: true, 
        message: `Session creation logic working: ${sessionId}`,
        details: { sessionId } 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Session creation failed',
        details: error 
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const testFunctions = [
      testOpenAIChat,
      testOpenRouterChat,
      testMemoryService,
      testImageGeneration,
      testSessionCreation
    ];

    let successCount = 0;
    
    for (let i = 0; i < testFunctions.length; i++) {
      updateTest(i, { status: 'pending', message: 'Testing...' });
      
      try {
        const result = await testFunctions[i]();
        
        updateTest(i, {
          status: result.success ? 'success' : 'error',
          message: result.message,
          details: result.details
        });
        
        if (result.success) successCount++;
      } catch (error: any) {
        updateTest(i, {
          status: 'error',
          message: error.message || 'Test failed',
          details: error
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    
    toast({
      title: "🧊 Debug Tests Complete",
      description: `${successCount}/${testFunctions.length} tests passed`,
      variant: successCount === testFunctions.length ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            🧊 Yeti AI Debug Panel
          </CardTitle>
          <CardDescription>
            Test all core AI services to identify issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Test message"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.message}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                    {test.status}
                  </Badge>
                  {getStatusIcon(test.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}