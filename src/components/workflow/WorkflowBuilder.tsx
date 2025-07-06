
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Play, Save, Settings, Zap, Clock, Webhook, 
  GitBranch, Brain, AlertCircle, CheckCircle 
} from 'lucide-react';
import { workflowEngine, Workflow, WorkflowStep, WorkflowTrigger } from '@/lib/workflow/WorkflowEngine';
import { platforms } from '@/data/platforms';

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [] as WorkflowStep[],
    triggers: [] as WorkflowTrigger[]
  });

  const stepTypes = [
    { value: 'ai-task', label: 'AI Task', icon: Brain },
    { value: 'platform-action', label: 'Platform Action', icon: Zap },
    { value: 'condition', label: 'Condition', icon: GitBranch },
    { value: 'delay', label: 'Delay', icon: Clock },
    { value: 'webhook', label: 'Webhook', icon: Webhook }
  ];

  const loadWorkflows = useCallback(() => {
    setWorkflows(workflowEngine.listWorkflows());
  }, []);

  React.useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const createWorkflow = async () => {
    if (!newWorkflow.name.trim()) return;

    const workflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      steps: newWorkflow.steps,
      triggers: newWorkflow.triggers,
      isActive: true,
      createdAt: new Date(),
      runCount: 0
    };

    await workflowEngine.createWorkflow(workflow);
    loadWorkflows();
    setIsCreating(false);
    setNewWorkflow({ name: '', description: '', steps: [], triggers: [] });
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const executionId = await workflowEngine.executeWorkflow(workflowId);
      console.log(`Workflow execution started: ${executionId}`);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'ai-task',
      name: 'New Step',
      config: {},
      nextSteps: []
    };

    if (selectedWorkflow) {
      setSelectedWorkflow({
        ...selectedWorkflow,
        steps: [...selectedWorkflow.steps, newStep]
      });
    } else {
      setNewWorkflow({
        ...newWorkflow,
        steps: [...newWorkflow.steps, newStep]
      });
    }
  };

  const addTrigger = () => {
    const newTrigger: WorkflowTrigger = {
      type: 'manual',
      config: {}
    };

    if (selectedWorkflow) {
      setSelectedWorkflow({
        ...selectedWorkflow,
        triggers: [...selectedWorkflow.triggers, newTrigger]
      });
    } else {
      setNewWorkflow({
        ...newWorkflow,
        triggers: [...newWorkflow.triggers, newTrigger]
      });
    }
  };

  const StepEditor = ({ step, onUpdate }: { step: WorkflowStep; onUpdate: (updated: WorkflowStep) => void }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {stepTypes.find(t => t.value === step.type)?.icon && 
              React.createElement(stepTypes.find(t => t.value === step.type)!.icon, { className: "h-4 w-4" })
            }
            <Input
              value={step.name}
              onChange={(e) => onUpdate({ ...step, name: e.target.value })}
              className="font-medium"
            />
          </div>
          <Badge variant="outline">{step.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Step Type</Label>
          <Select value={step.type} onValueChange={(value) => onUpdate({ ...step, type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stepTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {step.type === 'ai-task' && (
          <div>
            <Label>AI Prompt</Label>
            <Textarea
              value={step.config.prompt || ''}
              onChange={(e) => onUpdate({ ...step, config: { ...step.config, prompt: e.target.value } })}
              placeholder="Enter the prompt for the AI task..."
            />
          </div>
        )}

        {step.type === 'platform-action' && (
          <div className="space-y-2">
            <div>
              <Label>Platform</Label>
              <Select 
                value={step.config.platform || ''} 
                onValueChange={(value) => onUpdate({ ...step, config: { ...step.config, platform: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Input
                value={step.config.action || ''}
                onChange={(e) => onUpdate({ ...step, config: { ...step.config, action: e.target.value } })}
                placeholder="Enter action name"
              />
            </div>
          </div>
        )}

        {step.type === 'delay' && (
          <div>
            <Label>Delay (milliseconds)</Label>
            <Input
              type="number"
              value={step.config.delay || 1000}
              onChange={(e) => onUpdate({ ...step, config: { ...step.config, delay: parseInt(e.target.value) } })}
            />
          </div>
        )}

        {step.type === 'webhook' && (
          <div className="space-y-2">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={step.config.url || ''}
                onChange={(e) => onUpdate({ ...step, config: { ...step.config, url: e.target.value } })}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select 
                value={step.config.method || 'POST'} 
                onValueChange={(value) => onUpdate({ ...step, config: { ...step.config, method: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔧 Workflow Builder</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>Build automated workflows with AI and platform integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Workflow Name</Label>
              <Input
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Describe what this workflow does"
              />
            </div>

            <Tabs defaultValue="steps" className="w-full">
              <TabsList>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Workflow Steps</h3>
                  <Button onClick={addStep} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                
                {newWorkflow.steps.map((step, index) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    onUpdate={(updated) => {
                      const updatedSteps = [...newWorkflow.steps];
                      updatedSteps[index] = updated;
                      setNewWorkflow({ ...newWorkflow, steps: updatedSteps });
                    }}
                  />
                ))}
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Workflow Triggers</h3>
                  <Button onClick={addTrigger} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trigger
                  </Button>
                </div>
                
                {newWorkflow.triggers.map((trigger, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <Select 
                          value={trigger.type} 
                          onValueChange={(value) => {
                            const updatedTriggers = [...newWorkflow.triggers];
                            updatedTriggers[index] = { ...trigger, type: value as any };
                            setNewWorkflow({ ...newWorkflow, triggers: updatedTriggers });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="schedule">Schedule</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="platform-event">Platform Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={createWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {workflow.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Steps:</span>
                  <Badge variant="outline">{workflow.steps.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Triggers:</span>
                  <Badge variant="outline">{workflow.triggers.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Runs:</span>
                  <span>{workflow.runCount}</span>
                </div>
                {workflow.lastRun && (
                  <div className="flex justify-between text-sm">
                    <span>Last Run:</span>
                    <span>{workflow.lastRun.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => executeWorkflow(workflow.id)}
                  disabled={!workflow.isActive}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
