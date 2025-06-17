/**
 * Yeti AI Agent - The Intelligence Behind Cross-Platform Automation
 * Created by Yethikrishna R
 * 
 * This is the core AI that understands natural language and orchestrates
 * complex workflows across all connected platforms.
 */

import { workflowOrchestrator, WorkflowDefinition, WorkflowStep } from './workflowOrchestrator';
import { ConnectionService } from '@/lib/supabase/connectionService';
import { platforms } from '@/data/platforms';

export interface AgentCapability {
  name: string;
  description: string;
  platforms: string[];
  examples: string[];
}

export interface AgentResponse {
  message: string;
  actions?: {
    type: 'execute_workflow' | 'create_workflow' | 'connect_platform' | 'info';
    payload?: any;
  }[];
  suggestedWorkflows?: string[];
  executionId?: string;
}

export class YetiAgent {
  private capabilities: AgentCapability[] = [];

  constructor() {
    console.log('🤖 Yeti AI Agent initializing...');
    this.initializeCapabilities();
    console.log('✨ Yeti AI Agent ready! I can help you automate anything across platforms.');
  }

  private initializeCapabilities() {
    this.capabilities = [
      {
        name: 'Social Media Management',
        description: 'Post content, manage followers, respond to comments and DMs across all social platforms',
        platforms: ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'],
        examples: [
          'Post this message to all my social media accounts',
          'Auto-reply to DMs with a friendly message',
          'Follow everyone who mentions my brand',
          'Create a thread about the latest AI developments'
        ]
      },
      {
        name: 'Development & Deployment',
        description: 'Create repositories, write code, deploy to multiple platforms automatically',
        platforms: ['github', 'vercel', 'netlify', 'firebase'],
        examples: [
          'Create a new React project and deploy it everywhere',
          'Push my code to GitHub and deploy to Vercel and Netlify',
          'Set up GitHub Pages for my repository',
          'Create an issue for the bug I found'
        ]
      },
      {
        name: 'Content Creation',
        description: 'Generate content with AI and distribute across platforms',
        platforms: ['openai', 'anthropic', 'huggingface'],
        examples: [
          'Generate a blog post about AI and share it on LinkedIn',
          'Create a social media campaign for my product launch',
          'Write code comments and documentation',
          'Generate images for my social media posts'
        ]
      },
      {
        name: 'Productivity Automation',
        description: 'Manage emails, calendar, notifications, and workspace tools',
        platforms: ['gmail', 'google-drive', 'notion', 'slack'],
        examples: [
          'Send a summary email of today\'s activities',
          'Create a Notion page with meeting notes',
          'Backup all my files to Google Drive',
          'Notify my team when deployment is complete'
        ]
      },
      {
        name: 'Customer Support',
        description: 'Automated customer service across all communication channels',
        platforms: ['twitter', 'facebook', 'instagram', 'slack'],
        examples: [
          'Respond to customer complaints with empathy',
          'Escalate negative feedback to the support team',
          'Auto-respond to common questions',
          'Monitor brand mentions and reply appropriately'
        ]
      },
      {
        name: 'News & Information',
        description: 'Aggregate news, analyze trends, and share insights',
        platforms: ['twitter', 'linkedin', 'slack'],
        examples: [
          'Share the latest tech news every morning',
          'Create weekly industry roundups',
          'Monitor competitor news and alert me',
          'Summarize news articles into Twitter threads'
        ]
      }
    ];
  }

  async processNaturalLanguage(input: string, userId: string): Promise<AgentResponse> {
    console.log(`🧠 Yeti processing: "${input}"`);
    
    const normalizedInput = input.toLowerCase().trim();
    
    // Log the interaction
    await ConnectionService.logExecution(
      userId,
      'yeti-agent',
      'process_natural_language',
      { input },
      null,
      'pending'
    );

    try {
      // Intent recognition and response generation
      const response = await this.analyzeIntent(normalizedInput, userId);
      
      await ConnectionService.logExecution(
        userId,
        'yeti-agent',
        'process_natural_language',
        { input },
        response,
        'success'
      );
      
      return response;
    } catch (error) {
      const errorResponse: AgentResponse = {
        message: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your request.`
      };
      
      await ConnectionService.logExecution(
        userId,
        'yeti-agent',
        'process_natural_language',
        { input },
        errorResponse,
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      return errorResponse;
    }
  }

  private async analyzeIntent(input: string, userId: string): Promise<AgentResponse> {
    // Get user's connected platforms
    const connections = await ConnectionService.getUserConnections(userId);
    const connectedPlatforms = connections.map(c => c.platform_id);

    // Pattern matching for different intents
    if (this.matchesPattern(input, ['post', 'share', 'publish', 'upload'], ['social', 'media', 'twitter', 'facebook', 'instagram', 'linkedin'])) {
      return this.handleSocialMediaIntent(input, userId, connectedPlatforms);
    }

    if (this.matchesPattern(input, ['deploy', 'create', 'build', 'push'], ['website', 'app', 'project', 'code', 'github', 'vercel', 'netlify'])) {
      return this.handleDevelopmentIntent(input, userId, connectedPlatforms);
    }

    if (this.matchesPattern(input, ['generate', 'create', 'write'], ['content', 'post', 'article', 'copy', 'text', 'image'])) {
      return this.handleContentCreationIntent(input, userId, connectedPlatforms);
    }

    if (this.matchesPattern(input, ['automate', 'schedule', 'every', 'daily', 'weekly'], ['respond', 'reply', 'follow', 'unfollow', 'dm', 'message'])) {
      return this.handleAutomationIntent(input, userId, connectedPlatforms);
    }

    if (this.matchesPattern(input, ['help', 'what', 'how', 'can', 'show'], ['do', 'capabilities', 'features', 'workflows'])) {
      return this.handleHelpIntent(input, connectedPlatforms);
    }

    if (this.matchesPattern(input, ['news', 'latest', 'updates'], ['share', 'post', 'summarize', 'tech', 'industry'])) {
      return this.handleNewsIntent(input, userId, connectedPlatforms);
    }

    // Default response with suggestions
    return {
      message: `I understand you want to work with: "${input}". Here are some things I can help you with:`,
      suggestedWorkflows: [
        'social-media-campaign',
        'full-deployment-pipeline',
        'content-creator-automation',
        'customer-support-automation'
      ]
    };
  }

  private async handleSocialMediaIntent(input: string, userId: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    const socialPlatforms = connectedPlatforms.filter(p => 
      ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'].includes(p)
    );

    if (socialPlatforms.length === 0) {
      return {
        message: "I'd love to help you with social media! However, you need to connect your social media accounts first.",
        actions: [{
          type: 'connect_platform',
          payload: { category: 'social-media' }
        }]
      };
    }

    // Extract content from the input
    const contentMatch = input.match(/["']([^"']+)["']/) || input.match(/post\s+(.+)/);
    const content = contentMatch ? contentMatch[1] : 'Sample post content';

    // Execute social media campaign
    const execution = await workflowOrchestrator.executeWorkflow(
      'social-media-campaign',
      userId,
      { content, mediaIds: [] }
    );

    return {
      message: `🚀 Posting "${content}" to ${socialPlatforms.length} connected social media platforms! I'll post to each platform with a small delay to avoid rate limits.`,
      executionId: execution.id,
      actions: [{
        type: 'execute_workflow',
        payload: { workflowId: 'social-media-campaign', variables: { content } }
      }]
    };
  }

  private async handleDevelopmentIntent(input: string, userId: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    const devPlatforms = connectedPlatforms.filter(p => 
      ['github', 'vercel', 'netlify', 'firebase'].includes(p)
    );

    if (!devPlatforms.includes('github')) {
      return {
        message: "To help with development tasks, I need access to your GitHub account first.",
        actions: [{
          type: 'connect_platform',
          payload: { platformId: 'github' }
        }]
      };
    }

    // Extract project details
    const projectMatch = input.match(/(?:project|app|website)\s+(?:called\s+)?["']?([^"'\s]+)["']?/) || 
                         input.match(/create\s+(?:a\s+)?(.+?)(?:\s+and|\s+then|$)/);
    const projectName = projectMatch ? projectMatch[1].replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase() : 'yeti-project';

    const execution = await workflowOrchestrator.executeWorkflow(
      'full-deployment-pipeline',
      userId,
      { 
        projectName,
        projectDescription: `Project created by Yeti AI Agent`,
        framework: 'react',
        buildCommand: 'npm run build'
      }
    );

    return {
      message: `🏗️ Creating and deploying project "${projectName}" across all connected platforms! I'll set up GitHub repository, deploy to Vercel, Netlify, and enable GitHub Pages.`,
      executionId: execution.id
    };
  }

  private async handleContentCreationIntent(input: string, userId: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    const aiPlatforms = connectedPlatforms.filter(p => 
      ['openai', 'anthropic', 'huggingface'].includes(p)
    );

    if (aiPlatforms.length === 0) {
      return {
        message: "To generate content, I need access to AI platforms like OpenAI. Please connect an AI service first.",
        actions: [{
          type: 'connect_platform',
          payload: { category: 'ai-tools' }
        }]
      };
    }

    // Extract topic from input
    const topicMatch = input.match(/about\s+(.+?)(?:\s+and|\s+for|$)/) || 
                      input.match(/(?:create|generate|write)\s+(.+)/);
    const topic = topicMatch ? topicMatch[1] : 'technology trends';

    const execution = await workflowOrchestrator.executeWorkflow(
      'content-creator-automation',
      userId,
      { topic }
    );

    return {
      message: `✨ Creating AI-generated content about "${topic}" and distributing it across your connected social media platforms!`,
      executionId: execution.id
    };
  }

  private async handleAutomationIntent(input: string, userId: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    if (input.includes('respond') || input.includes('reply') || input.includes('dm')) {
      const execution = await workflowOrchestrator.executeWorkflow(
        'customer-support-automation',
        userId,
        {}
      );

      return {
        message: `🤖 Setting up automated customer support! I'll monitor DMs and comments across your social platforms and respond intelligently. Negative feedback will be escalated to your team.`,
        executionId: execution.id
      };
    }

    if (input.includes('news') || input.includes('share') || input.includes('daily')) {
      return {
        message: `📰 I can set up automated news sharing! This will fetch the latest tech news every 4 hours and share it across your platforms.`,
        suggestedWorkflows: ['news-aggregation']
      };
    }

    return {
      message: `🔄 I can help you automate many tasks! Here are some popular automation workflows:`,
      suggestedWorkflows: [
        'customer-support-automation',
        'news-aggregation',
        'content-creator-automation'
      ]
    };
  }

  private handleNewsIntent(input: string, userId: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    return Promise.resolve({
      message: `📰 I'll set up automated news curation for you! I can fetch the latest tech news and share professionally formatted summaries on your social platforms.`,
      actions: [{
        type: 'execute_workflow',
        payload: { workflowId: 'news-aggregation' }
      }]
    });
  }

  private handleHelpIntent(input: string, connectedPlatforms: string[]): Promise<AgentResponse> {
    const capabilityList = this.capabilities.map(cap => {
      const availablePlatforms = cap.platforms.filter(p => connectedPlatforms.includes(p));
      const status = availablePlatforms.length > 0 ? '✅' : '⚠️';
      return `${status} **${cap.name}**: ${cap.description}`;
    }).join('\n\n');

    return Promise.resolve({
      message: `🤖 I'm Yeti, your AI automation assistant! Here's what I can do:\n\n${capabilityList}\n\n💡 Try saying things like:\n• "Post this to all my social media"\n• "Create a new project and deploy it everywhere"\n• "Generate content about AI and share it"\n• "Set up automated customer support"`,
      suggestedWorkflows: workflowOrchestrator.getWorkflows().map(w => w.id)
    });
  }

  private matchesPattern(input: string, actions: string[], objects: string[]): boolean {
    const hasAction = actions.some(action => input.includes(action));
    const hasObject = objects.some(object => input.includes(object));
    return hasAction && hasObject;
  }

  // Advanced workflow creation from natural language
  async createWorkflowFromDescription(description: string, userId: string): Promise<WorkflowDefinition> {
    console.log(`🛠️ Creating custom workflow from: "${description}"`);
    
    // This is a simplified version - in production, you'd use more sophisticated NLP
    const workflowId = `custom_${Date.now()}`;
    const steps: WorkflowStep[] = [];

    // Parse the description and create steps
    if (description.includes('post') && description.includes('social')) {
      steps.push({
        id: 'social-post',
        platform: 'twitter',
        action: 'postTweet',
        parameters: { text: '${content}' }
      });
    }

    if (description.includes('deploy') && description.includes('github')) {
      steps.push({
        id: 'deploy-step',
        platform: 'vercel',
        action: 'deployProject',
        parameters: { repo: '${repo}' }
      });
    }

    const workflow: WorkflowDefinition = {
      id: workflowId,
      name: `Custom Workflow: ${description.substring(0, 50)}...`,
      description,
      trigger: { type: 'manual' },
      steps
    };

    workflowOrchestrator.registerWorkflow(workflow);
    return workflow;
  }

  // Get personalized suggestions based on connected platforms
  getPersonalizedSuggestions(connectedPlatforms: string[]): string[] {
    const suggestions: string[] = [];

    if (connectedPlatforms.includes('twitter') && connectedPlatforms.includes('openai')) {
      suggestions.push('Generate AI-powered tweets about trending topics');
    }

    if (connectedPlatforms.includes('github') && connectedPlatforms.includes('vercel')) {
      suggestions.push('Auto-deploy your GitHub repositories to Vercel');
    }

    if (connectedPlatforms.some(p => ['twitter', 'facebook', 'instagram'].includes(p))) {
      suggestions.push('Set up automated customer support across social media');
    }

    if (connectedPlatforms.includes('slack') && connectedPlatforms.includes('github')) {
      suggestions.push('Get Slack notifications for GitHub activity');
    }

    return suggestions;
  }
}

// Singleton instance
export const yetiAgent = new YetiAgent();