import { aiService } from './aiService';
import { Platform } from '@/types/platform';
import { aiRouter } from './aiRouter';
import { mcpService } from '@/lib/mcp/McpService';
import { IMcpResponse } from '@/lib/mcp/IMcpServer';

export interface AgenticDecision {
  action: 'ask_user' | 'execute_action' | 'provide_info' | 'request_permission';
  platform?: string;
  reasoning: string;
  suggestedAction?: string;
  requiresUserInput?: boolean;
  confidence: number;
}

export interface AgenticResponse {
  response: string;
  decisions: AgenticDecision[];
  executedActions: Array<AgenticActionResult>;
  needsUserInput: boolean;
}

interface AgenticActionResult {
  platform: string;
  action: string;
  success: boolean;
  data: any;
  summary: string;
}

// Simple types for dashboard compatibility
interface AgentTask {
  id: string;
  description: string;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  actions: Array<{ type: string; status: string; }>;
}

interface AgentMemory {
  shortTerm: Map<string, any>;
  longTerm: Record<string, any>;
  context: string[];
  preferences: Record<string, any>;
  learnings: Record<string, any>;
}

class AgenticService {
  private activeTasks: AgentTask[] = [];
  private memory: AgentMemory = {
    shortTerm: new Map(),
    longTerm: {},
    context: [],
    preferences: {},
    learnings: {}
  };

  constructor() {
    // Initialize with empty state
  }

  async processRequest(
    userMessage: string, 
    connectedPlatforms: Platform[], 
    userId?: string
  ): Promise<AgenticResponse> {
    const decisions: AgenticDecision[] = [];
    const executedActions: AgenticActionResult[] = [];
    let needsUserInput = false;

    // Analyze user intent and determine autonomous actions
    const intentAnalysis = await this.analyzeUserIntent(userMessage, connectedPlatforms);
    
    // Generate initial response using the AI router
    let response = await aiRouter.routeRequest(userMessage, connectedPlatforms);

    // Process autonomous decisions
    for (const decision of intentAnalysis.decisions) {
      if (decision.confidence > 0.8 && decision.action === 'execute_action') {
        try {
          // Execute high-confidence actions autonomously
          const actionResult = await this.executeAutonomousAction(decision, userId || '');
          executedActions.push(actionResult);
          
          // Update response with action results
          response += `\n\n✅ **Autonomous Action Completed**: ${decision.suggestedAction}\nResult: ${actionResult.summary}`;
        } catch (error) {
          console.error('Autonomous action failed:', error);
          decision.action = 'ask_user';
          decision.reasoning = `Failed to execute autonomously: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
      
      if (decision.action === 'ask_user' || decision.requiresUserInput) {
        needsUserInput = true;
        response += `\n\n🤔 **Need Your Input**: ${decision.reasoning}`;
        if (decision.suggestedAction) {
          response += `\nSuggested action: ${decision.suggestedAction}`;
        }
      }
      
      decisions.push(decision);
    }

    return {
      response,
      decisions,
      executedActions,
      needsUserInput
    };
  }

  private async analyzeUserIntent(userMessage: string, connectedPlatforms: Platform[]): Promise<{ decisions: AgenticDecision[] }> {
    const analysisPrompt = `
    You are Yeti AI, an autonomous agent. Analyze this user message and determine what actions should be taken.

    User Message: "${userMessage}"
    
    Connected Platforms: ${connectedPlatforms.map(p => p.name).join(', ')}
    
    For each potential action, determine:
    1. What action should be taken (ask_user, execute_action, provide_info, request_permission)
    2. Which platform (if any) should be used
    3. Your reasoning for the decision
    4. Confidence level (0-1)
    5. Whether user input is required

    Respond in JSON format with an array of decisions:
    {
      "decisions": [
        {
          "action": "execute_action",
          "platform": "github",
          "reasoning": "User wants to create a repository, I can do this autonomously",
          "suggestedAction": "Create a new GitHub repository with provided specifications",
          "requiresUserInput": false,
          "confidence": 0.9
        }
      ]
    }

    Guidelines:
    - Be autonomous for simple, low-risk actions (confidence > 0.8)
    - Ask for permission for sensitive actions (deleting, publishing, spending money)
    - Request clarification when intent is unclear (confidence < 0.6)
    - Consider the capabilities of connected platforms
    `;

    try {
      const analysisResponse = await aiRouter.routeRequest(analysisPrompt, connectedPlatforms);
      
      // Try to parse JSON response
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse intent analysis:', error);
    }

    // Fallback to simple analysis
    return {
      decisions: [{
        action: 'provide_info',
        reasoning: 'Unable to determine specific actions, providing general assistance',
        confidence: 0.5,
        requiresUserInput: false
      }]
    };
  }

  private async executeAutonomousAction(decision: AgenticDecision, userId: string): Promise<AgenticActionResult> {
    if (!decision.platform || !decision.suggestedAction) {
      throw new Error('Invalid decision for autonomous execution');
    }

    console.log(`🤖 Yeti AI executing autonomous action: ${decision.suggestedAction} on ${decision.platform}`);

    // Use the centralized McpService for all platform actions
    const result: IMcpResponse = await mcpService.executeAutonomousAction(
      decision.platform,
      decision.suggestedAction,
      userId,
      { autonomous: true },
      [] // Pass empty array since we don't have connectedPlatforms here
    );

    return {
      platform: decision.platform,
      action: decision.suggestedAction,
      success: result.success,
      data: result.data,
      summary: result.success ? 'Action completed successfully' : result.error || 'Action failed'
    };
  }

  async requestUserPermission(action: string, platform: string, details: string): Promise<string> {
    return `🔐 **Permission Required**\n\nI'd like to ${action} on ${platform}.\n\nDetails: ${details}\n\nShould I proceed? (Yes/No)`;
  }

  async adaptToUserFeedback(feedback: string, previousDecisions: AgenticDecision[]): Promise<AgenticDecision[]> {
    const adaptationPrompt = `
    The user provided this feedback: "${feedback}"
    
    Previous decisions I made: ${JSON.stringify(previousDecisions, null, 2)}
    
    How should I adapt my decision-making? What should I do differently next time?
    Respond with updated decision criteria and confidence adjustments.
    `;

    const adaptationResponse = await aiRouter.routeRequest(adaptationPrompt, []);
    console.log('🧠 Yeti AI learning from feedback:', adaptationResponse);
    
    // Store learning for future decisions (in a real implementation, this would be persistent)
    return previousDecisions.map(decision => ({
      ...decision,
      confidence: Math.max(0.1, decision.confidence - 0.1) // Reduce confidence slightly for similar future decisions
    }));
  }

  // Expose methods needed by the dashboard
  public getActiveTasks(): AgentTask[] {
    return this.activeTasks;
  }

  public getMemorySnapshot(): AgentMemory {
    return {
      ...this.memory,
      shortTerm: new Map(this.memory.shortTerm) // Create a copy
    };
  }
}

export const agenticService: AgenticService = new AgenticService();