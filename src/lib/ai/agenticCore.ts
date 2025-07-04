import { supabase } from '@/integrations/supabase/client';

export interface AgentAction {
  id: string;
  type: 'web_search' | 'form_fill' | 'code_deploy' | 'file_upload' | 'email_send' | 'browser_navigate' | 'terminal_exec' | 'image_generation' | 'video_generation' | 'web_scraping';
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface AgentTask {
  id: string;
  description: string;
  subtasks: string[];
  actions: AgentAction[];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  requiredPermissions: string[];
  estimatedDuration?: number;
}

export interface AgentMemory {
  shortTerm: Map<string, any>;
  longTerm: Record<string, any>;
  context: string[];
  preferences: Record<string, any>;
  learnings: Record<string, any>;
}

export class YetiAgentCore {
  private memory: AgentMemory;
  private activeTasks: Map<string, AgentTask>;
  private capabilities: Set<string>;
  private userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
    this.memory = {
      shortTerm: new Map(),
      longTerm: {},
      context: [],
      preferences: {},
      learnings: {}
    };
    this.activeTasks = new Map();
    this.capabilities = new Set([
      'web_search',
      'web_scraping', 
      'image_generation',
      'video_generation',
      'text_to_speech',
      'speech_to_text',
      'memory_storage',
      'multi_language',
      'code_analysis',
      'document_analysis'
    ]);
  }

  async planTask(userRequest: string): Promise<AgentTask> {
    console.log('🧠 Yeti AI: Planning task for request:', userRequest);

    // Analyze the request and break it down
    const taskAnalysis = await this.analyzeRequest(userRequest);
    
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: userRequest,
      subtasks: taskAnalysis.subtasks,
      actions: taskAnalysis.actions,
      status: 'planning',
      priority: taskAnalysis.priority,
      requiredPermissions: taskAnalysis.permissions,
      estimatedDuration: taskAnalysis.estimatedDuration
    };

    this.activeTasks.set(task.id, task);
    return task;
  }

  private async analyzeRequest(request: string): Promise<{
    subtasks: string[];
    actions: AgentAction[];
    priority: 'low' | 'medium' | 'high';
    permissions: string[];
    estimatedDuration: number;
  }> {
    // Simple analysis - in a full implementation, this would use advanced NLP
    const requestLower = request.toLowerCase();
    const actions: AgentAction[] = [];
    const subtasks: string[] = [];
    let priority: 'low' | 'medium' | 'high' = 'medium';
    const permissions: string[] = [];

    // Detect intent and create appropriate actions
    if (requestLower.includes('search') || requestLower.includes('find')) {
      actions.push(this.createAction('web_search', { query: request }));
      subtasks.push('Perform web search');
      permissions.push('web_access');
    }

    if (requestLower.includes('image') || requestLower.includes('picture')) {
      actions.push(this.createAction('image_generation', { prompt: request }));
      subtasks.push('Generate image');
      permissions.push('image_generation');
    }

    if (requestLower.includes('video')) {
      actions.push(this.createAction('video_generation', { prompt: request }));
      subtasks.push('Generate video');
      permissions.push('video_generation');
      priority = 'high';
    }

    if (requestLower.includes('code') || requestLower.includes('program')) {
      actions.push(this.createAction('code_deploy', { requirements: request }));
      subtasks.push('Analyze and generate code');
      permissions.push('code_execution');
    }

    // Default to conversational response if no specific actions detected
    if (actions.length === 0) {
      subtasks.push('Provide conversational response');
    }

    return {
      subtasks,
      actions,
      priority,
      permissions,
      estimatedDuration: actions.length * 30 // 30 seconds per action estimate
    };
  }

  private createAction(type: AgentAction['type'], parameters: Record<string, any>): AgentAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      parameters,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
  }

  async executeTask(taskId: string): Promise<{
    success: boolean;
    results: any[];
    executedActions: AgentAction[];
    summary: string;
  }> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    console.log('🚀 Yeti AI: Executing task:', task.description);
    task.status = 'executing';

    const results: any[] = [];
    const executedActions: AgentAction[] = [];

    try {
      for (const action of task.actions) {
        action.status = 'running';
        
        try {
          const result = await this.executeAction(action);
          action.result = result;
          action.status = 'completed';
          results.push(result);
          executedActions.push(action);
          
          console.log(`✅ Action ${action.type} completed:`, result);
        } catch (error: any) {
          action.error = error.message;
          action.status = 'failed';
          console.error(`❌ Action ${action.type} failed:`, error);
        }
      }

      task.status = 'completed';
      
      // Store results in memory
      this.memory.shortTerm.set(taskId, { task, results });
      
      return {
        success: true,
        results,
        executedActions,
        summary: this.generateTaskSummary(task, results)
      };

    } catch (error: any) {
      task.status = 'failed';
      console.error('❌ Task execution failed:', error);
      
      return {
        success: false,
        results,
        executedActions,
        summary: `Task failed: ${error.message}`
      };
    }
  }

  private async executeAction(action: AgentAction): Promise<any> {
    console.log(`🔧 Executing action: ${action.type}`, action.parameters);

    switch (action.type) {
      case 'web_search':
        return await this.executeWebSearch(action.parameters);
      
      case 'image_generation':
        return await this.executeImageGeneration(action.parameters);
      
      case 'video_generation':
        return await this.executeVideoGeneration(action.parameters);
      
      case 'web_scraping':
        return await this.executeWebScraping(action.parameters);
      
      case 'form_fill':
        return await this.executeFormFill(action.parameters);
      
      case 'code_deploy':
        return await this.executeCodeDeploy(action.parameters);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeWebSearch(params: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-web-scraper', {
        body: {
          action: 'search',
          query: params.query || params.url,
          searchEngine: 'google'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Web search failed:', error);
      throw error;
    }
  }

  private async executeImageGeneration(params: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-image-generation', {
        body: {
          provider: 'a4f',
          model: 'flux-1-schnell',
          prompt: params.prompt,
          width: params.width || 1024,
          height: params.height || 1024
        }
      });

      if (error) throw error;
      return { type: 'image', url: data.images[0].url, prompt: params.prompt };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }

  private async executeVideoGeneration(params: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-video-generation', {
        body: {
          provider: 'a4f',
          model: 'minimax-video-01',
          prompt: params.prompt,
          duration: params.duration || 5,
          fps: params.fps || 24
        }
      });

      if (error) throw error;
      return { type: 'video', url: data.videos[0].url, prompt: params.prompt };
    } catch (error) {
      console.error('Video generation failed:', error);
      throw error;
    }
  }

  private async executeWebScraping(params: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('yeti-web-scraper', {
        body: {
          action: 'scrape',
          url: params.url,
          extractText: true,
          takeScreenshot: params.screenshot || false
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Web scraping failed:', error);
      throw error;
    }
  }

  private async executeFormFill(params: any): Promise<any> {
    // This would integrate with a browser automation service
    console.log('Form fill action - would integrate with browser automation');
    return { status: 'form_fill_simulated', data: params };
  }

  private async executeCodeDeploy(params: any): Promise<any> {
    // This would integrate with GitHub/deployment services  
    console.log('Code deploy action - would integrate with deployment services');
    return { status: 'code_deploy_simulated', data: params };
  }

  private generateTaskSummary(task: AgentTask, results: any[]): string {
    const completedActions = task.actions.filter(a => a.status === 'completed').length;
    const totalActions = task.actions.length;
    
    let summary = `Task "${task.description}" completed with ${completedActions}/${totalActions} actions successful.`;
    
    if (results.length > 0) {
      summary += ` Generated ${results.length} result(s): `;
      summary += results.map(r => {
        if (r.type === 'image') return `image (${r.prompt})`;
        if (r.type === 'video') return `video (${r.prompt})`;
        if (r.searchResults) return `web search (${r.searchResults.length} results)`;
        return 'data result';
      }).join(', ');
    }
    
    return summary;
  }

  updateMemory(key: string, value: any, persistent = false): void {
    if (persistent) {
      this.memory.longTerm[key] = value;
    } else {
      this.memory.shortTerm.set(key, value);
    }
  }

  getMemory(key: string): any {
    return this.memory.shortTerm.get(key) || this.memory.longTerm[key];
  }

  addCapability(capability: string): void {
    this.capabilities.add(capability);
  }

  hasCapability(capability: string): boolean {
    return this.capabilities.has(capability);
  }

  getActiveTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values());
  }

  getMemorySnapshot(): AgentMemory {
    return {
      ...this.memory,
      shortTerm: new Map(this.memory.shortTerm) // Create a copy
    };
  }
}

export const yetiAgentCore = new YetiAgentCore();