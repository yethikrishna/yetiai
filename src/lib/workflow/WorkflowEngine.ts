
import { Platform } from '@/types/platform';
import { mcpService } from '../mcp/McpService';

export interface WorkflowStep {
  id: string;
  type: 'ai-task' | 'platform-action' | 'condition' | 'delay' | 'webhook';
  name: string;
  config: Record<string, any>;
  nextSteps: string[];
  retryCount?: number;
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
  runCount: number;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'webhook' | 'platform-event' | 'manual';
  config: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStep?: string;
  results: Record<string, any>;
  errors: string[];
}

class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  async createWorkflow(workflow: Workflow): Promise<string> {
    this.workflows.set(workflow.id, workflow);
    
    // Set up triggers
    for (const trigger of workflow.triggers) {
      await this.setupTrigger(workflow.id, trigger);
    }
    
    console.log(`🔧 Workflow "${workflow.name}" created successfully`);
    return workflow.id;
  }

  async executeWorkflow(workflowId: string, initialData: Record<string, any> = {}): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
      results: initialData,
      errors: []
    };

    this.executions.set(executionId, execution);
    
    try {
      // Find entry points (steps with no dependencies)
      const entrySteps = workflow.steps.filter(step => 
        !workflow.steps.some(s => s.nextSteps.includes(step.id))
      );

      for (const step of entrySteps) {
        await this.executeStep(executionId, step, execution.results);
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      
      // Update workflow stats
      workflow.runCount++;
      workflow.lastRun = new Date();
      
      console.log(`✅ Workflow execution ${executionId} completed`);
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error(`❌ Workflow execution ${executionId} failed:`, error);
    }

    return executionId;
  }

  private async executeStep(executionId: string, step: WorkflowStep, context: Record<string, any>): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    execution.currentStep = step.id;
    console.log(`🔄 Executing step: ${step.name}`);

    try {
      let result: any;

      switch (step.type) {
        case 'ai-task':
          result = await this.executeAITask(step, context);
          break;
        case 'platform-action':
          result = await this.executePlatformAction(step, context);
          break;
        case 'condition':
          result = await this.evaluateCondition(step, context);
          break;
        case 'delay':
          result = await this.executeDelay(step);
          break;
        case 'webhook':
          result = await this.executeWebhook(step, context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      execution.results[step.id] = result;
      
      // Execute next steps
      const workflow = this.workflows.get(execution.workflowId);
      if (workflow) {
        for (const nextStepId of step.nextSteps) {
          const nextStep = workflow.steps.find(s => s.id === nextStepId);
          if (nextStep) {
            await this.executeStep(executionId, nextStep, execution.results);
          }
        }
      }
    } catch (error) {
      execution.errors.push(`Step ${step.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async executeAITask(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    const { aiService } = await import('../ai/aiService');
    const prompt = this.interpolateString(step.config.prompt, context);
    return await aiService.generateResponse(prompt, []);
  }

  private async executePlatformAction(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    const { platform, action, parameters } = step.config;
    const interpolatedParams = this.interpolateObject(parameters, context);
    
    return await mcpService.executeAutonomousAction(
      platform,
      action,
      'workflow-engine',
      interpolatedParams,
      []
    );
  }

  private async evaluateCondition(step: WorkflowStep, context: Record<string, any>): Promise<boolean> {
    const { condition, operator, value } = step.config;
    const actualValue = this.resolveValue(condition, context);
    
    switch (operator) {
      case 'equals': return actualValue === value;
      case 'not_equals': return actualValue !== value;
      case 'greater_than': return actualValue > value;
      case 'less_than': return actualValue < value;
      case 'contains': return String(actualValue).includes(value);
      default: return false;
    }
  }

  private async executeDelay(step: WorkflowStep): Promise<void> {
    const delay = step.config.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async executeWebhook(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    const { url, method = 'POST', headers = {}, body } = step.config;
    const interpolatedBody = this.interpolateObject(body, context);
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(interpolatedBody)
    });
    
    return await response.json();
  }

  private async setupTrigger(workflowId: string, trigger: WorkflowTrigger): Promise<void> {
    switch (trigger.type) {
      case 'schedule':
        this.setupScheduledTrigger(workflowId, trigger);
        break;
      case 'webhook':
        // Webhook triggers would be handled by the API endpoint
        break;
    }
  }

  private setupScheduledTrigger(workflowId: string, trigger: WorkflowTrigger): void {
    const { interval } = trigger.config;
    const intervalMs = this.parseInterval(interval);
    
    const taskId = `${workflowId}_schedule`;
    const task = setInterval(() => {
      this.executeWorkflow(workflowId);
    }, intervalMs);
    
    this.scheduledTasks.set(taskId, task);
  }

  private parseInterval(interval: string): number {
    // Parse intervals like "5m", "1h", "30s"
    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) return 60000; // Default 1 minute
    
    const [, value, unit] = match;
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseInt(value) * multipliers[unit as keyof typeof multipliers];
  }

  private interpolateString(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(context[key] || match);
    });
  }

  private interpolateObject(obj: any, context: Record<string, any>): any {
    if (typeof obj === 'string') {
      return this.interpolateString(obj, context);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, context));
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }
    return obj;
  }

  private resolveValue(path: string, context: Record<string, any>): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  listWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  listExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());
    return workflowId ? executions.filter(e => e.workflowId === workflowId) : executions;
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
