
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMcpServer } from '@/hooks/useMcpServer';
import { usePlatforms } from '@/hooks/usePlatforms';
import { Loader2, Play, History, Code, CheckCircle, XCircle } from 'lucide-react';

export function McpTestPanel() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [action, setAction] = useState('');
  const [parameters, setParameters] = useState('{}');
  const [showHistory, setShowHistory] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const { executeRequest, executionHistory, loadExecutionHistory, isExecuting } = useMcpServer();
  const { connectedPlatforms } = usePlatforms();

  const handleExecute = async () => {
    if (!selectedPlatform || !action) return;

    try {
      const parsedParameters = JSON.parse(parameters);
      const response = await executeRequest({
        platform: selectedPlatform,
        action,
        parameters: parsedParameters
      });
      
      setLastResponse(response);
    } catch (error) {
      console.error('Failed to execute MCP request:', error);
    }
  };

  const handleShowHistory = async () => {
    await loadExecutionHistory(selectedPlatform || undefined);
    setShowHistory(true);
  };

  const quickActions = {
    github: [
      { name: 'Get Repositories', action: 'get_repositories', params: '{}' },
      { name: 'Create Repository', action: 'create_repository', params: '{"name": "test-repo", "description": "Created via MCP"}' },
      { name: 'Search Repositories', action: 'search_repositories', params: '{"query": "javascript"}' }
    ],
    gmail: [
      { name: 'Get Emails', action: 'get_emails', params: '{"maxResults": 10}' },
      { name: 'Send Email', action: 'send_email', params: '{"to": "test@example.com", "subject": "Hello from MCP", "body": "This email was sent via MCP!"}' }
    ],
    slack: [
      { name: 'Get Channels', action: 'get_channels', params: '{}' },
      { name: 'Send Message', action: 'send_message', params: '{"channel": "#general", "text": "Hello from MCP!"}' }
    ]
  };

  return (
    <div className="space-y-6">
      {!showHistory ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                MCP Dynamic Executor
              </CardTitle>
              <CardDescription>
                Test the dynamic MCP server that uses AI to generate and execute code for platform interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedPlatforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action">Action</Label>
                  <Input
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g., get_repositories, send_email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Textarea
                  id="parameters"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={3}
                />
              </div>

              {selectedPlatform && quickActions[selectedPlatform as keyof typeof quickActions] && (
                <div>
                  <Label>Quick Actions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quickActions[selectedPlatform as keyof typeof quickActions].map((quickAction) => (
                      <Button
                        key={quickAction.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAction(quickAction.action);
                          setParameters(quickAction.params);
                        }}
                      >
                        {quickAction.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleExecute} 
                  disabled={!selectedPlatform || !action || isExecuting}
                  className="flex-1"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Request
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleShowHistory}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>

          {lastResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastResponse.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Execution Result
                  <Badge variant={lastResponse.success ? "default" : "destructive"}>
                    {lastResponse.success ? "Success" : "Failed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastResponse.data && (
                  <div>
                    <Label>Response Data</Label>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(lastResponse.data, null, 2)}
                    </pre>
                  </div>
                )}

                {lastResponse.error && (
                  <div>
                    <Label>Error</Label>
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                      {lastResponse.error}
                    </div>
                  </div>
                )}

                {lastResponse.generatedCode && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Generated Code
                    </Label>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                      {lastResponse.generatedCode}
                    </pre>
                  </div>
                )}

                {lastResponse.executionLog && (
                  <div>
                    <Label>Execution Log</Label>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded">
                      {lastResponse.executionLog}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Execution History
            </CardTitle>
            <CardDescription>
              View past MCP executions and their results
            </CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowHistory(false)}>
                Back to Executor
              </Button>
              <Button variant="outline" onClick={() => loadExecutionHistory()}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {executionHistory.map((log, index) => (
                  <div key={log.id || index} className="border p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'}>
                          {log.status}
                        </Badge>
                        <span className="font-medium">{log.platform_id}</span>
                        <span className="text-sm text-gray-600">{log.action}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {log.error_message && (
                      <div className="text-sm text-red-600 mb-2">
                        Error: {log.error_message}
                      </div>
                    )}
                    
                    {log.execution_time_ms && (
                      <div className="text-xs text-gray-500">
                        Execution time: {log.execution_time_ms}ms
                      </div>
                    )}
                  </div>
                ))}
                
                {executionHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No execution history found
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
