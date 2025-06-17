"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { workflowOrchestrator, WorkflowDefinition, WorkflowExecution } from '@/lib/ai/workflowOrchestrator';
import { yetiAgent } from '@/lib/ai/yetiAgent';
import { useToast } from './ui/use-toast';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Zap, 
  Bot, 
  GitBranch, 
  MessageSquare,
  Calendar,
  Workflow,
  TrendingUp,
  Users,
  Share2,
  Code,
  Image,
  FileText,
  Mail,
  Bell
} from 'lucide-react';

interface WorkflowOrchestratorProps {
  userId: string;
}

export function WorkflowOrchestrator({ userId }: WorkflowOrchestratorProps) {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('predefined');

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, [userId]);

  const loadWorkflows = () => {
    const availableWorkflows = workflowOrchestrator.getWorkflows();
    setWorkflows(availableWorkflows);
  };

  const loadExecutions = () => {
    const userExecutions = workflowOrchestrator.getUserExecutions(userId);
    setExecutions(userExecutions);
  };

  const executeWorkflow = async (workflowId: string, variables: Record<string, any> = {}) => {
    setIsExecuting(true);
    try {
      console.log(`🚀 Executing workflow: ${workflowId}`, variables);
      
      const execution = await workflowOrchestrator.executeWorkflow(workflowId, userId, variables);
      
      toast({
        title: "Workflow Started! 🚀",
        description: `Executing ${workflows.find(w => w.id === workflowId)?.name || workflowId}`,
      });

      loadExecutions();
    } catch (error) {
      console.error('Workflow execution failed:', error);
      toast({
        title: "Workflow Failed ❌",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNaturalLanguageCommand = async () => {
    if (!customPrompt.trim()) return;
    
    setIsExecuting(true);
    try {
      console.log(`🧠 Processing natural language: "${customPrompt}"`);
      
      const response = await yetiAgent.processNaturalLanguage(customPrompt, userId);
      
      toast({
        title: "Yeti AI Responded! 🤖",
        description: response.message.substring(0, 100) + (response.message.length > 100 ? '...' : ''),
      });

      if (response.executionId) {
        loadExecutions();
      }
      
      setCustomPrompt('');
    } catch (error) {
      console.error('Natural language processing failed:', error);
      toast({
        title: "Command Failed ❌",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const pauseExecution = async (executionId: string) => {
    await workflowOrchestrator.pauseExecution(executionId);
    loadExecutions();
    toast({
      title: "Execution Paused ⏸️",
      description: "Workflow execution has been paused",
    });
  };

  const resumeExecution = async (executionId: string) => {
    await workflowOrchestrator.resumeExecution(executionId);
    loadExecutions();
    toast({
      title: "Execution Resumed ▶️",
      description: "Workflow execution has been resumed",
    });
  };

  const getWorkflowIcon = (workflowId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'social-media-campaign': <Share2 className="w-4 h-4" />,
      'full-deployment-pipeline': <Code className="w-4 h-4" />,
      'content-creator-automation': <FileText className="w-4 h-4" />,
      'customer-support-automation': <MessageSquare className="w-4 h-4" />,
      'news-aggregation': <TrendingUp className="w-4 h-4" />
    };
    return iconMap[workflowId] || <Workflow className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'running': 'bg-blue-500',
      'completed': 'bg-green-500',
      'failed': 'bg-red-500',
      'paused': 'bg-yellow-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getExecutionProgress = (execution: WorkflowExecution) => {
    const workflow = workflows.find(w => w.id === execution.workflowId);
    if (!workflow) return 0;
    
    const totalSteps = workflow.steps.length;
    const completedSteps = execution.currentStepIndex;
    return (completedSteps / totalSteps) * 100;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Bot className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Yeti Workflow Orchestrator
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Command your digital universe with AI-powered automation across all platforms. 
          Create, deploy, and manage complex workflows with natural language.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="predefined" className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="natural" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>AI Commands</span>
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>Executions</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Monitor</span>
          </TabsTrigger>
        </TabsList>

        {/* Predefined Workflows */}
        <TabsContent value="predefined" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card 
                key={workflow.id} 
                className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300 bg-white/70 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    {getWorkflowIcon(workflow.id)}
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <Badge variant="secondary">{workflow.steps.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Trigger:</span>
                      <Badge variant="outline">{workflow.trigger.type}</Badge>
                    </div>
                    <Button 
                      onClick={() => executeWorkflow(workflow.id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isExecuting}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Natural Language Commands */}
        <TabsContent value="natural" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Talk to Yeti AI</span>
              </CardTitle>
              <CardDescription>
                Describe what you want to automate and I'll handle the rest. Try commands like:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">💬 Social Media</p>
                  <p className="text-xs text-purple-600">"Post this to all my social media"</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">🚀 Development</p>
                  <p className="text-xs text-blue-600">"Create and deploy a React project"</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium">🤖 AI Content</p>
                  <p className="text-xs text-green-600">"Generate content about AI trends"</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 font-medium">📈 Analytics</p>
                  <p className="text-xs text-orange-600">"Set up automated news sharing"</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Tell me what you want to automate... (e.g., 'Post this message to all my social media accounts' or 'Create a new project and deploy it everywhere')"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px] bg-white/50"
                />
                <Button 
                  onClick={handleNaturalLanguageCommand}
                  disabled={isExecuting || !customPrompt.trim()}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Processing...' : 'Execute Command'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executions */}
        <TabsContent value="executions" className="space-y-6">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {executions.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GitBranch className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No workflow executions yet</p>
                    <p className="text-sm text-gray-500">Start a workflow to see executions here</p>
                  </CardContent>
                </Card>
              ) : (
                executions.map((execution) => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  const progress = getExecutionProgress(execution);
                  
                  return (
                    <Card key={execution.id} className="bg-white/70 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getWorkflowIcon(execution.workflowId)}
                            <div>
                              <CardTitle className="text-base">
                                {workflow?.name || execution.workflowId}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Started: {execution.startTime.toLocaleString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge 
                            className={`${getStatusColor(execution.status)} text-white`}
                          >
                            {execution.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Step {execution.currentStepIndex + 1} of {workflow?.steps.length || 0}
                            </div>
                            <div className="flex space-x-2">
                              {execution.status === 'running' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => pauseExecution(execution.id)}
                                >
                                  <Pause className="w-3 h-3" />
                                </Button>
                              )}
                              {execution.status === 'paused' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => resumeExecution(execution.id)}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {execution.error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              Error: {execution.error}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Monitor */}
        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{workflows.length}</div>
                <p className="text-xs text-gray-500">Available workflows</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {executions.filter(e => e.status === 'running').length}
                </div>
                <p className="text-xs text-gray-500">Currently running</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {executions.length > 0 
                    ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-gray-500">Completion rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}