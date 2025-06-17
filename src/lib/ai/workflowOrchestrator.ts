/**
 * Yeti Workflow Orchestrator - The Brain of Cross-Platform Automation
 * Created by Yethikrishna R
 */

import { platformHandlers } from '@/handlers/platformHandlers';
import { ConnectionService } from '@/lib/supabase/connectionService';
import { getPlatformHandler } from '@/handlers/platformHandlers';

export interface WorkflowStep {
  id: string;
  platform: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: {
    if?: string;
    equals?: any;
    contains?: any;
    greaterThan?: number;
    lessThan?: number;
  };
  delay?: number; // milliseconds
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'manual' | 'schedule' | 'webhook' | 'event';
    schedule?: string; // cron expression
    event?: string;
  };
  steps: WorkflowStep[];
  variables?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStepIndex: number;
  stepResults: Record<string, any>;
  variables: Record<string, any>;
  error?: string;
}

export class WorkflowOrchestrator {
  private executions = new Map<string, WorkflowExecution>();
  private workflows = new Map<string, WorkflowDefinition>();

  constructor() {
    console.log('🤖 Yeti Workflow Orchestrator initialized - Ready for cross-platform automation!');
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows() {
    // Social Media Campaign Workflow
    this.registerWorkflow({
      id: 'social-media-campaign',
      name: 'Cross-Platform Social Media Campaign',
      description: 'Automatically post content across all social media platforms',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'twitter-post',
          platform: 'twitter',
          action: 'postTweet',
          parameters: { text: '${content}', mediaIds: '${mediaIds}' }
        },
        {
          id: 'facebook-post',
          platform: 'facebook',
          action: 'createPost',
          parameters: { message: '${content}', media: '${media}' },
          delay: 2000
        },
        {
          id: 'instagram-post',
          platform: 'instagram',
          action: 'createPost',
          parameters: { caption: '${content}', media: '${media}' },
          delay: 3000
        },
        {
          id: 'linkedin-post',
          platform: 'linkedin',
          action: 'createPost',
          parameters: { text: '${content}', media: '${media}' },
          delay: 2000
        }
      ]
    });

    // Development Deployment Workflow
    this.registerWorkflow({
      id: 'full-deployment-pipeline',
      name: 'Complete Development to Deployment Pipeline',
      description: 'Code, commit, deploy to multiple platforms automatically',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'create-repo',
          platform: 'github',
          action: 'createRepository',
          parameters: { 
            name: '${projectName}',
            description: '${projectDescription}',
            private: false,
            auto_init: true
          }
        },
        {
          id: 'deploy-vercel',
          platform: 'vercel',
          action: 'deployProject',
          parameters: { 
            repo: '${github.result.full_name}',
            framework: '${framework}'
          },
          delay: 5000
        },
        {
          id: 'deploy-netlify',
          platform: 'netlify',
          action: 'deployProject',
          parameters: { 
            repo: '${github.result.clone_url}',
            buildCommand: '${buildCommand}'
          },
          delay: 3000
        },
        {
          id: 'enable-github-pages',
          platform: 'github',
          action: 'enablePages',
          parameters: {
            repo: '${github.result.full_name}',
            source: { branch: 'main' }
          },
          delay: 2000
        },
        {
          id: 'slack-notification',
          platform: 'slack',
          action: 'sendMessage',
          parameters: {
            channel: 'deployments',
            text: '🚀 ${projectName} deployed successfully!\nVercel: ${vercel.result.url}\nNetlify: ${netlify.result.url}\nGitHub Pages: ${github-pages.result.html_url}'
          }
        }
      ]
    });

    // Content Creator Workflow
    this.registerWorkflow({
      id: 'content-creator-automation',
      name: 'AI Content Creator & Distributor',
      description: 'Generate content with AI and distribute across platforms',
      trigger: { type: 'schedule', schedule: '0 9 * * *' }, // Daily at 9 AM
      steps: [
        {
          id: 'generate-content',
          platform: 'openai',
          action: 'generateContent',
          parameters: { 
            prompt: 'Create an engaging social media post about ${topic}',
            maxTokens: 280
          }
        },
        {
          id: 'generate-image',
          platform: 'openai',
          action: 'generateImage',
          parameters: { 
            prompt: 'Create a visual for: ${content}',
            size: '1024x1024'
          },
          delay: 2000
        },
        {
          id: 'post-to-platforms',
          platform: 'workflow',
          action: 'executeWorkflow',
          parameters: {
            workflowId: 'social-media-campaign',
            variables: {
              content: '${openai.result.content}',
              media: ['${openai.image.url}']
            }
          }
        }
      ]
    });

    // Customer Support Automation
    this.registerWorkflow({
      id: 'customer-support-automation',
      name: 'AI-Powered Customer Support',
      description: 'Automatically respond to DMs and comments across platforms',
      trigger: { type: 'event', event: 'new_message' },
      steps: [
        {
          id: 'analyze-sentiment',
          platform: 'openai',
          action: 'analyzeSentiment',
          parameters: { text: '${message.content}' }
        },
        {
          id: 'generate-response',
          platform: 'openai',
          action: 'generateResponse',
          parameters: { 
            context: '${message.content}',
            tone: '${sentiment.result.tone}',
            platform: '${message.platform}'
          },
          conditions: {
            if: 'sentiment.result.score',
            greaterThan: -0.5
          }
        },
        {
          id: 'send-response',
          platform: '${message.platform}',
          action: 'sendDirectMessage',
          parameters: {
            userId: '${message.userId}',
            message: '${response.result.text}'
          }
        },
        {
          id: 'escalate-if-negative',
          platform: 'slack',
          action: 'sendMessage',
          parameters: {
            channel: 'customer-support',
            text: '⚠️ Negative sentiment detected from ${message.username}: "${message.content}"'
          },
          conditions: {
            if: 'sentiment.result.score',
            lessThan: -0.5
          }
        }
      ]
    });

    // News Aggregation and Distribution
    this.registerWorkflow({
      id: 'news-aggregation',
      name: 'AI News Curator & Distributor',
      description: 'Fetch latest news, summarize with AI, and share across platforms',
      trigger: { type: 'schedule', schedule: '0 */4 * * *' }, // Every 4 hours
      steps: [
        {
          id: 'fetch-news',
          platform: 'external',
          action: 'fetchNews',
          parameters: { 
            category: '${newsCategory}',
            sources: ['tech-crunch', 'ars-technica', 'wired']
          }
        },
        {
          id: 'summarize-news',
          platform: 'openai',
          action: 'summarizeContent',
          parameters: { 
            articles: '${news.result.articles}',
            maxWords: 50
          }
        },
        {
          id: 'create-thread',
          platform: 'twitter',
          action: 'createThread',
          parameters: { 
            tweets: '${summary.result.thread}'
          }
        },
        {
          id: 'post-to-linkedin',
          platform: 'linkedin',
          action: 'createPost',
          parameters: { 
            text: '${summary.result.professional_summary}',
            link: '${news.result.topArticle.url}'
          }
        }
      ]
    });
  }

  registerWorkflow(workflow: WorkflowDefinition) {
    this.workflows.set(workflow.id, workflow);
    console.log(`📋 Workflow registered: ${workflow.name}`);
  }

  async executeWorkflow(
    workflowId: string, 
    userId: string, 
    variables: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      userId,
      status: 'running',
      startTime: new Date(),
      currentStepIndex: 0,
      stepResults: {},
      variables: { ...workflow.variables, ...variables }
    };

    this.executions.set(executionId, execution);
    console.log(`🚀 Starting workflow execution: ${workflow.name} (${executionId})`);

    try {
      await this.runWorkflowSteps(execution, workflow);
      execution.status = 'completed';
      execution.endTime = new Date();
      console.log(`✅ Workflow completed: ${workflow.name} (${executionId})`);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.endTime = new Date();
      console.error(`❌ Workflow failed: ${workflow.name} (${executionId})`, error);
      
      // Log to Supabase
      await ConnectionService.logExecution(
        userId,
        'workflow-orchestrator',
        `execute_workflow_${workflowId}`,
        { workflowId, variables },
        execution,
        'error',
        execution.error
      );
    }

    return execution;
  }

  private async runWorkflowSteps(execution: WorkflowExecution, workflow: WorkflowDefinition) {
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      execution.currentStepIndex = i;

      console.log(`🔄 Executing step ${i + 1}/${workflow.steps.length}: ${step.id} (${step.platform})`);

      // Check conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, execution)) {
        console.log(`⏭️ Skipping step ${step.id} - conditions not met`);
        continue;
      }

      // Add delay if specified
      if (step.delay) {
        console.log(`⏱️ Waiting ${step.delay}ms before executing ${step.id}`);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // Execute step with retry logic
      const maxAttempts = step.retry?.maxAttempts || 1;
      const backoffMs = step.retry?.backoffMs || 1000;
      
      let lastError: Error | null = null;
      let success = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await this.executeStep(step, execution);
          execution.stepResults[step.id] = result;
          success = true;
          break;
        } catch (error) {
          lastError = error as Error;
          console.warn(`⚠️ Step ${step.id} failed (attempt ${attempt}/${maxAttempts}):`, error);
          
          if (attempt < maxAttempts) {
            const delay = backoffMs * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`🔄 Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!success && lastError) {
        throw new Error(`Step ${step.id} failed after ${maxAttempts} attempts: ${lastError.message}`);
      }
    }
  }

  private async executeStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    // Replace variables in parameters
    const resolvedParameters = this.resolveVariables(step.parameters, execution);
    
    console.log(`📋 Step parameters:`, resolvedParameters);

    // Special handling for workflow execution
    if (step.platform === 'workflow') {
      if (step.action === 'executeWorkflow') {
        return await this.executeWorkflow(
          resolvedParameters.workflowId,
          execution.userId,
          resolvedParameters.variables
        );
      }
    }

    // Special handling for external APIs
    if (step.platform === 'external') {
      return await this.executeExternalAction(step.action, resolvedParameters);
    }

    // Get platform handler
    const handler = getPlatformHandler(step.platform);
    if (!handler) {
      throw new Error(`No handler found for platform: ${step.platform}`);
    }

    // Get user connection for this platform
    const connections = await ConnectionService.getUserConnections(execution.userId);
    const connection = connections.find(c => c.platform_id === step.platform);
    
    if (!connection) {
      throw new Error(`No active connection found for platform: ${step.platform}`);
    }

    // Execute the action
    if (typeof handler[step.action as keyof typeof handler] === 'function') {
      const method = handler[step.action as keyof typeof handler] as Function;
      
      // Different platforms have different method signatures
      if (step.platform === 'github') {
        return await method.call(handler, connection.credentials.token, ...Object.values(resolvedParameters));
      } else if (step.platform === 'openai') {
        return await method.call(handler, resolvedParameters);
      } else {
        return await method.call(handler, resolvedParameters);
      }
    } else {
      throw new Error(`Action ${step.action} not found for platform ${step.platform}`);
    }
  }

  private async executeExternalAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'fetchNews':
        // In a real implementation, this would call news APIs
        console.log('🗞️ Fetching news from external sources...');
        return {
          articles: [
            {
              title: 'AI Breakthrough in Automation',
              summary: 'New AI system automates complex workflows across platforms',
              url: 'https://example.com/ai-breakthrough'
            }
          ],
          topArticle: {
            title: 'AI Breakthrough in Automation',
            url: 'https://example.com/ai-breakthrough'
          }
        };
        
      default:
        throw new Error(`Unknown external action: ${action}`);
    }
  }

  private evaluateConditions(conditions: WorkflowStep['conditions'], execution: WorkflowExecution): boolean {
    if (!conditions) return true;

    const value = this.resolveVariable(conditions.if || '', execution);

    if (conditions.equals !== undefined) {
      return value === conditions.equals;
    }
    if (conditions.contains !== undefined) {
      return String(value).includes(String(conditions.contains));
    }
    if (conditions.greaterThan !== undefined) {
      return Number(value) > conditions.greaterThan;
    }
    if (conditions.lessThan !== undefined) {
      return Number(value) < conditions.lessThan;
    }

    return true;
  }

  private resolveVariables(obj: any, execution: WorkflowExecution): any {
    if (typeof obj === 'string') {
      return this.resolveVariable(obj, execution);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveVariables(item, execution));
    }
    if (obj && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveVariables(value, execution);
      }
      return resolved;
    }
    return obj;
  }

  private resolveVariable(template: string, execution: WorkflowExecution): any {
    if (!template.includes('${')) {
      return template;
    }

    return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const parts = path.split('.');
      let value: any = execution.variables;

      // Check step results first
      if (parts[0] in execution.stepResults) {
        value = execution.stepResults;
      }

      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          console.warn(`Variable not found: ${path}`);
          return match; // Return original if not found
        }
      }

      return value;
    });
  }

  // Public methods for workflow management
  getWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  getUserExecutions(userId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(e => e.userId === userId);
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      console.log(`⏸️ Workflow execution paused: ${executionId}`);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      console.log(`▶️ Workflow execution resumed: ${executionId}`);
      // In a real implementation, you'd continue from where it left off
    }
  }
}

// Singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();