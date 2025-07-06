import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluginExecutionRequest {
  pluginId: string;
  action: string;
  parameters: Record<string, any>;
  permissions?: string[];
  userId?: string;
}

interface YetiPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'productivity' | 'automation' | 'communication' | 'development' | 'creative' | 'utility';
  permissions: string[];
  actions: PluginAction[];
  config: Record<string, any>;
  isActive: boolean;
}

interface PluginAction {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
  }>;
  handler: string; // Function name to execute
}

// Built-in Yeti AI plugins
const BUILTIN_PLUGINS: YetiPlugin[] = [
  {
    id: 'yeti-web-search',
    name: 'Web Search',
    version: '1.0.0',
    description: 'Search the web and retrieve relevant information',
    category: 'utility',
    permissions: ['web_access'],
    isActive: true,
    config: {},
    actions: [
      {
        name: 'search',
        description: 'Search the web with a query',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Search query' },
          { name: 'maxResults', type: 'number', required: false, description: 'Maximum number of results' }
        ],
        handler: 'executeWebSearch'
      }
    ]
  },
  {
    id: 'yeti-form-filler',
    name: 'Auto Form Filler',
    version: '1.0.0',
    description: 'Automatically fill web forms with provided data',
    category: 'automation',
    permissions: ['web_access', 'dom_manipulation'],
    isActive: true,
    config: {},
    actions: [
      {
        name: 'fillForm',
        description: 'Fill a web form with provided data',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL of the page with the form' },
          { name: 'formData', type: 'object', required: true, description: 'Data to fill in the form' },
          { name: 'submitForm', type: 'boolean', required: false, description: 'Whether to submit the form after filling' }
        ],
        handler: 'executeFormFill'
      }
    ]
  },
  {
    id: 'yeti-email-agent',
    name: 'Email Agent',
    version: '1.0.0',
    description: 'Send emails and manage email communications',
    category: 'communication',
    permissions: ['email_access'],
    isActive: true,
    config: {},
    actions: [
      {
        name: 'sendEmail',
        description: 'Send an email',
        parameters: [
          { name: 'to', type: 'string', required: true, description: 'Recipient email address' },
          { name: 'subject', type: 'string', required: true, description: 'Email subject' },
          { name: 'body', type: 'string', required: true, description: 'Email body content' },
          { name: 'attachments', type: 'array', required: false, description: 'File attachments' }
        ],
        handler: 'executeSendEmail'
      }
    ]
  },
  {
    id: 'yeti-code-deployer',
    name: 'Code Deployer',
    version: '1.0.0',
    description: 'Deploy code to various platforms',
    category: 'development',
    permissions: ['github_access', 'deployment_access'],
    isActive: true,
    config: {},
    actions: [
      {
        name: 'deployToNetlify',
        description: 'Deploy a static site to Netlify',
        parameters: [
          { name: 'siteName', type: 'string', required: true, description: 'Name of the site' },
          { name: 'buildCommand', type: 'string', required: false, description: 'Build command' },
          { name: 'publishDir', type: 'string', required: false, description: 'Publish directory' }
        ],
        handler: 'executeNetlifyDeploy'
      }
    ]
  },
  {
    id: 'yeti-task-scheduler',
    name: 'Task Scheduler',
    version: '1.0.0',
    description: 'Schedule and manage tasks and reminders',
    category: 'productivity',
    permissions: ['calendar_access'],
    isActive: true,
    config: {},
    actions: [
      {
        name: 'scheduleTask',
        description: 'Schedule a task or reminder',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'Task title' },
          { name: 'description', type: 'string', required: false, description: 'Task description' },
          { name: 'scheduledTime', type: 'string', required: true, description: 'When to execute the task (ISO date)' },
          { name: 'recurring', type: 'boolean', required: false, description: 'Whether the task should repeat' }
        ],
        handler: 'executeScheduleTask'
      }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const requestUrl = new URL(req.url);
    const action = requestUrl.pathname.split('/').pop();

    if (action === 'list-plugins') {
      return new Response(JSON.stringify({
        success: true,
        plugins: BUILTIN_PLUGINS
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'execute') {
      const body: PluginExecutionRequest = await req.json();
      console.log('🔌 Yeti Plugin Executor: Executing plugin:', body.pluginId, body.action);

      const result = await executePlugin(body, supabaseClient);
      
      return new Response(JSON.stringify({
        success: true,
        pluginId: body.pluginId,
        action: body.action,
        result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid endpoint');

  } catch (error) {
    console.error('Plugin executor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executePlugin(request: PluginExecutionRequest, supabaseClient: any) {
  const plugin = BUILTIN_PLUGINS.find(p => p.id === request.pluginId);
  
  if (!plugin) {
    throw new Error(`Plugin not found: ${request.pluginId}`);
  }

  if (!plugin.isActive) {
    throw new Error(`Plugin is disabled: ${request.pluginId}`);
  }

  const action = plugin.actions.find(a => a.name === request.action);
  if (!action) {
    throw new Error(`Action not found: ${request.action} in plugin ${request.pluginId}`);
  }

  // Validate required parameters
  for (const param of action.parameters) {
    if (param.required && !(param.name in request.parameters)) {
      throw new Error(`Missing required parameter: ${param.name}`);
    }
  }

  // Check permissions
  if (request.permissions) {
    const missingPermissions = plugin.permissions.filter(p => !request.permissions!.includes(p));
    if (missingPermissions.length > 0) {
      throw new Error(`Missing permissions: ${missingPermissions.join(', ')}`);
    }
  }

  // Execute the plugin action
  switch (action.handler) {
    case 'executeWebSearch':
      return await executeWebSearch(request.parameters, supabaseClient);
    
    case 'executeFormFill':
      return await executeFormFill(request.parameters, supabaseClient);
    
    case 'executeSendEmail':
      return await executeSendEmail(request.parameters, supabaseClient);
    
    case 'executeNetlifyDeploy':
      return await executeNetlifyDeploy(request.parameters, supabaseClient);
    
    case 'executeScheduleTask':
      return await executeScheduleTask(request.parameters, supabaseClient);
    
    default:
      throw new Error(`Unknown handler: ${action.handler}`);
  }
}

async function executeWebSearch(params: any, supabaseClient: any) {
  console.log('🔍 Executing web search:', params.query);
  
  try {
    // Use the existing web scraper function
    const { data, error } = await supabaseClient.functions.invoke('yeti-web-scraper', {
      body: {
        action: 'search',
        query: params.query,
        maxResults: params.maxResults || 5
      }
    });

    if (error) throw error;
    
    return {
      status: 'success',
      query: params.query,
      results: data.searchResults || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      query: params.query,
      timestamp: new Date().toISOString()
    };
  }
}

async function executeFormFill(params: any, supabaseClient: any) {
  console.log('📝 Executing form fill:', params.url);
  
  try {
    // Use the browser agent function
    const { data, error } = await supabaseClient.functions.invoke('yeti-browser-agent', {
      body: {
        action: 'form_fill',
        url: params.url,
        formData: params.formData,
        submitForm: params.submitForm || false
      }
    });

    if (error) throw error;
    
    return {
      status: 'success',
      url: params.url,
      fieldsCompleted: Object.keys(params.formData).length,
      submitted: params.submitForm || false,
      result: data.result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      url: params.url,
      timestamp: new Date().toISOString()
    };
  }
}

async function executeSendEmail(params: any, supabaseClient: any) {
  console.log('📧 Executing send email to:', params.to);
  
  // This would integrate with email service (Gmail API, SendGrid, etc.)
  return {
    status: 'simulated',
    to: params.to,
    subject: params.subject,
    bodyLength: params.body.length,
    attachments: params.attachments?.length || 0,
    message: 'Email sending is simulated - would integrate with actual email service',
    timestamp: new Date().toISOString()
  };
}

async function executeNetlifyDeploy(params: any, supabaseClient: any) {
  console.log('🚀 Executing Netlify deploy:', params.siteName);
  
  // This would integrate with Netlify API
  return {
    status: 'simulated',
    siteName: params.siteName,
    buildCommand: params.buildCommand || 'npm run build',
    publishDir: params.publishDir || 'dist',
    deployUrl: `https://${params.siteName}.netlify.app`,
    message: 'Deployment is simulated - would integrate with actual Netlify API',
    timestamp: new Date().toISOString()
  };
}

async function executeScheduleTask(params: any, supabaseClient: any) {
  console.log('⏰ Executing schedule task:', params.title);
  
  try {
    // Store the scheduled task in the database
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
      const { data, error } = await supabaseClient.from('scheduled_tasks').insert({
        user_id: user.id,
        title: params.title,
        description: params.description,
        scheduled_time: params.scheduledTime,
        recurring: params.recurring || false,
        status: 'scheduled',
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    }
    
    return {
      status: 'success',
      title: params.title,
      scheduledTime: params.scheduledTime,
      recurring: params.recurring || false,
      message: 'Task scheduled successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      title: params.title,
      timestamp: new Date().toISOString()
    };
  }
}