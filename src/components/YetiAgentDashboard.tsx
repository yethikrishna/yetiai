import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Trash2
} from "lucide-react";
import { agenticService } from "@/lib/ai/agenticService";

interface TaskDisplay {
  id: string;
  description: string;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  actions: Array<{
    platform: string;
    action: string;
    summary: string;
    status: string;
  }>;
}

export function YetiAgentDashboard() {
  const [activeTasks, setActiveTasks] = useState<TaskDisplay[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskDisplay[]>([]);
  const [agentStats, setAgentStats] = useState({
    totalTasks: 0,
    successRate: 95,
    avgExecutionTime: 23,
    activeCapabilities: 8
  });
  const [isAgentActive, setIsAgentActive] = useState(true);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTasks = () => {
    try {
      const tasks = agenticService.getActiveTasks();
      const memory = agenticService.getMemorySnapshot();
      
      // Convert agent tasks to display format
      const displayTasks: TaskDisplay[] = tasks.map(task => ({
        id: task.id,
        description: task.description,
        status: task.status,
        progress: calculateProgress(task),
        startTime: new Date().toISOString(), // Would use actual start time
        actions: task.actions.map(action => ({
          platform: mapActionToPlatform(action.type),
          action: action.type,
          summary: `${action.type}: ${action.status}`,
          status: action.status
        }))
      }));

      setActiveTasks(displayTasks.filter(t => t.status !== 'completed' && t.status !== 'failed'));
      setCompletedTasks(displayTasks.filter(t => t.status === 'completed' || t.status === 'failed'));
      
      // Update stats
      setAgentStats(prev => ({
        ...prev,
        totalTasks: displayTasks.length,
        activeCapabilities: Array.from((agenticService as any).agentCore?.capabilities || []).length
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const calculateProgress = (task: any): number => {
    if (task.status === 'completed') return 100;
    if (task.status === 'failed') return 0;
    if (task.status === 'planning') return 10;
    
    // Calculate progress based on completed actions
    const completedActions = task.actions.filter((a: any) => a.status === 'completed').length;
    const totalActions = task.actions.length;
    return totalActions > 0 ? Math.max(20, (completedActions / totalActions) * 100) : 20;
  };

  const mapActionToPlatform = (actionType: string): string => {
    const mapping: Record<string, string> = {
      'web_search': 'Web Search',
      'image_generation': 'Art Studio',
      'video_generation': 'Motion Studio',
      'web_scraping': 'Web Scraper',
      'form_fill': 'Browser Agent',
      'code_deploy': 'GitHub'
    };
    return mapping[actionType] || 'Yeti AI';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'executing':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'executing':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const toggleAgent = () => {
    setIsAgentActive(!isAgentActive);
  };

  const clearCompletedTasks = () => {
    setCompletedTasks([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧊 Yeti Agent Dashboard</h1>
          <p className="text-gray-600">Monitor autonomous AI agent activities and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isAgentActive ? "default" : "secondary"} className="gap-2">
            <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-400' : 'bg-gray-400'}`} />
            {isAgentActive ? 'Active' : 'Paused'}
          </Badge>
          <Button onClick={toggleAgent} variant="outline" size="sm">
            {isAgentActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{agentStats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{agentStats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold">{agentStats.avgExecutionTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Capabilities</p>
                <p className="text-2xl font-bold">{agentStats.activeCapabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Management */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Tasks ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Tasks
              </CardTitle>
              <CardDescription>
                Currently executing autonomous tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active tasks</p>
                    <p className="text-sm">Yeti AI is ready for your next request</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.description}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                            <Progress value={task.progress} className="mb-2" />
                            <p className="text-sm text-gray-600">
                              Progress: {Math.round(task.progress)}%
                            </p>
                          </div>
                        </div>
                        
                        {task.actions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.actions.map((action, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {action.platform}: {action.action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completed Tasks
                  </CardTitle>
                  <CardDescription>
                    Recently completed autonomous tasks
                  </CardDescription>
                </div>
                <Button 
                  onClick={clearCompletedTasks} 
                  variant="outline" 
                  size="sm"
                  disabled={completedTasks.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No completed tasks</p>
                    <p className="text-sm">Completed tasks will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.description}</span>
                              <Badge 
                                variant={task.status === 'completed' ? 'default' : 'destructive'} 
                                className="text-xs"
                              >
                                {task.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Completed with {task.actions.length} actions
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Capabilities
              </CardTitle>
              <CardDescription>
                Available tools and integrations for autonomous actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Web Search', status: 'active', description: 'Search and retrieve web information' },
                  { name: 'Image Generation', status: 'active', description: 'Create images with AI' },
                  { name: 'Video Generation', status: 'active', description: 'Generate videos with AI' },
                  { name: 'Web Scraping', status: 'active', description: 'Extract data from websites' },
                  { name: 'Form Filling', status: 'beta', description: 'Automatically fill web forms' },
                  { name: 'Code Deployment', status: 'beta', description: 'Deploy code to various platforms' },
                  { name: 'Email Automation', status: 'beta', description: 'Send and manage emails' },
                  { name: 'Voice Processing', status: 'active', description: 'Text-to-speech and speech-to-text' }
                ].map((capability, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{capability.name}</h4>
                      <Badge 
                        variant={capability.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {capability.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{capability.description}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}