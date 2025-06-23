import { Platform } from '@/types/platform';

export interface AnalyticsEvent {
  id: string;
  type: 'ai_request' | 'platform_action' | 'workflow_execution' | 'user_action' | 'error';
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata: Record<string, any>;
  duration?: number;
  success: boolean;
}

export interface ModelPerformanceMetrics {
  modelName: string;
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  averageTokensUsed: number;
  costEstimate: number;
  errorRate: number;
  popularPromptTypes: string[];
}

export interface PlatformUsageMetrics {
  platformId: string;
  totalActions: number;
  successfulActions: number;
  averageExecutionTime: number;
  errorRate: number;
  mostUsedActions: string[];
  userEngagement: number;
}

export interface UserBehaviorInsights {
  userId: string;
  totalSessions: number;
  averageSessionDuration: number;
  preferredAIModels: string[];
  mostUsedPlatforms: string[];
  workflowsCreated: number;
  automationUsage: number;
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
}

class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private sessionId = this.generateSessionId();

  public static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics();
    }
    return AdvancedAnalytics.instance;
  }

  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    this.events.push(fullEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    console.log(`📊 Analytics: ${event.type}`, event.metadata);
  }

  trackAIRequest(model: string, prompt: string, response: string, duration: number, success: boolean): void {
    this.trackEvent({
      type: 'ai_request',
      metadata: {
        model,
        promptLength: prompt.length,
        responseLength: response.length,
        tokensEstimate: Math.ceil((prompt.length + response.length) / 4)
      },
      duration,
      success
    });
  }

  trackPlatformAction(platform: string, action: string, duration: number, success: boolean, metadata: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'platform_action',
      metadata: {
        platform,
        action,
        ...metadata
      },
      duration,
      success
    });
  }

  trackWorkflowExecution(workflowId: string, stepCount: number, duration: number, success: boolean): void {
    this.trackEvent({
      type: 'workflow_execution',
      metadata: {
        workflowId,
        stepCount
      },
      duration,
      success
    });
  }

  trackUserAction(action: string, metadata: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'user_action',
      metadata: {
        action,
        ...metadata
      },
      success: true
    });
  }

  trackError(error: Error, context: string, metadata: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'error',
      metadata: {
        error: error.message,
        stack: error.stack,
        context,
        ...metadata
      },
      success: false
    });
  }

  getModelPerformanceMetrics(): ModelPerformanceMetrics[] {
    const aiEvents = this.events.filter(e => e.type === 'ai_request');
    const modelGroups = this.groupBy(aiEvents, e => e.metadata.model);
    
    return Object.entries(modelGroups).map(([modelName, events]) => {
      const successfulEvents = events.filter(e => e.success);
      const totalTokens = events.reduce((sum, e) => sum + (e.metadata.tokensEstimate || 0), 0);
      
      return {
        modelName,
        totalRequests: events.length,
        successfulRequests: successfulEvents.length,
        averageResponseTime: this.average(events.map(e => e.duration || 0)),
        averageTokensUsed: totalTokens / events.length,
        costEstimate: this.estimateCost(modelName, totalTokens),
        errorRate: (events.length - successfulEvents.length) / events.length,
        popularPromptTypes: this.getPopularPromptTypes(events)
      };
    });
  }

  getPlatformUsageMetrics(): PlatformUsageMetrics[] {
    const platformEvents = this.events.filter(e => e.type === 'platform_action');
    const platformGroups = this.groupBy(platformEvents, e => e.metadata.platform);
    
    return Object.entries(platformGroups).map(([platformId, events]) => {
      const successfulEvents = events.filter(e => e.success);
      const actions = events.map(e => e.metadata.action);
      
      return {
        platformId,
        totalActions: events.length,
        successfulActions: successfulEvents.length,
        averageExecutionTime: this.average(events.map(e => e.duration || 0)),
        errorRate: (events.length - successfulEvents.length) / events.length,
        mostUsedActions: this.getMostFrequent(actions),
        userEngagement: this.calculateEngagement(events)
      };
    });
  }

  getUserBehaviorInsights(userId?: string): UserBehaviorInsights[] {
    const userEvents = userId 
      ? this.events.filter(e => e.userId === userId)
      : this.events.filter(e => e.userId);

    const userGroups = this.groupBy(userEvents, e => e.userId!);
    
    return Object.entries(userGroups).map(([userId, events]) => {
      const sessions = this.groupBy(events, e => e.sessionId);
      const aiEvents = events.filter(e => e.type === 'ai_request');
      const platformEvents = events.filter(e => e.type === 'platform_action');
      const workflowEvents = events.filter(e => e.type === 'workflow_execution');
      
      return {
        userId,
        totalSessions: Object.keys(sessions).length,
        averageSessionDuration: this.calculateAverageSessionDuration(sessions),
        preferredAIModels: this.getMostFrequent(aiEvents.map(e => e.metadata.model)),
        mostUsedPlatforms: this.getMostFrequent(platformEvents.map(e => e.metadata.platform)),
        workflowsCreated: new Set(workflowEvents.map(e => e.metadata.workflowId)).size,
        automationUsage: workflowEvents.length,
        expertiseLevel: this.determineExpertiseLevel(events)
      };
    });
  }

  getRealtimeMetrics() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp > last24Hours);
    
    return {
      totalEvents: recentEvents.length,
      aiRequests: recentEvents.filter(e => e.type === 'ai_request').length,
      platformActions: recentEvents.filter(e => e.type === 'platform_action').length,
      workflows: recentEvents.filter(e => e.type === 'workflow_execution').length,
      errors: recentEvents.filter(e => e.type === 'error').length,
      successRate: recentEvents.filter(e => e.success).length / recentEvents.length || 0,
      averageResponseTime: this.average(recentEvents.map(e => e.duration || 0))
    };
  }

  exportAnalytics(startDate?: Date, endDate?: Date): AnalyticsEvent[] {
    let filteredEvents = this.events;
    
    if (startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= endDate);
    }
    
    return filteredEvents;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      (groups[key] = groups[key] || []).push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private average(numbers: number[]): number {
    return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  private getMostFrequent<T>(array: T[]): T[] {
    const frequency = array.reduce((freq, item) => {
      freq[String(item)] = (freq[String(item)] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item as T);
  }

  private estimateCost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-3': 0.025,
      'gemini': 0.001
    };
    
    const costPerToken = costs[model.toLowerCase()] || 0.01;
    return (tokens / 1000) * costPerToken;
  }

  private getPopularPromptTypes(events: AnalyticsEvent[]): string[] {
    // Analyze prompt patterns to categorize them
    const types = events.map(e => {
      const prompt = e.metadata.prompt || '';
      if (prompt.includes('code') || prompt.includes('function')) return 'coding';
      if (prompt.includes('write') || prompt.includes('create')) return 'creative';
      if (prompt.includes('analyze') || prompt.includes('explain')) return 'analytical';
      if (prompt.includes('translate')) return 'translation';
      return 'general';
    });
    
    return this.getMostFrequent(types);
  }

  private calculateEngagement(events: AnalyticsEvent[]): number {
    const uniqueDays = new Set(events.map(e => e.timestamp.toDateString())).size;
    return events.length / Math.max(uniqueDays, 1);
  }

  private calculateAverageSessionDuration(sessions: Record<string, AnalyticsEvent[]>): number {
    const durations = Object.values(sessions).map(events => {
      if (events.length < 2) return 0;
      const sorted = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      return sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime();
    });
    
    return this.average(durations) / 1000 / 60; // Convert to minutes
  }

  private determineExpertiseLevel(events: AnalyticsEvent[]): 'beginner' | 'intermediate' | 'advanced' {
    const workflowEvents = events.filter(e => e.type === 'workflow_execution').length;
    const platformEvents = events.filter(e => e.type === 'platform_action').length;
    const complexityScore = workflowEvents * 3 + platformEvents;
    
    if (complexityScore > 50) return 'advanced';
    if (complexityScore > 15) return 'intermediate';
    return 'beginner';
  }
}

export const advancedAnalytics = AdvancedAnalytics.getInstance();
