import { groqService } from '@/lib/groq/groqService';
import { Platform } from '@/types/platform';
import { ConnectionService } from '@/lib/supabase/connectionService';
import { PipedreamMcpHandler } from './pipedreamMcpHandler';

export interface McpRequest {
  action: string;
  platform: string;
  parameters: Record<string, any>;
  userId: string;
}

export interface McpResponse {
  success: boolean;
  data?: any;
  error?: string;
  generatedCode?: string;
  executionLog?: string;
}

export class DynamicMcpServer {
  private static instance: DynamicMcpServer;
  
  static getInstance(): DynamicMcpServer {
    if (!DynamicMcpServer.instance) {
      DynamicMcpServer.instance = new DynamicMcpServer();
    }
    return DynamicMcpServer.instance;
  }

  async executeRequest(request: McpRequest, connectedPlatforms: Platform[]): Promise<McpResponse> {
    const startTime = Date.now();
    
    try {
      console.log('MCP Request:', request);
      
      // Log the execution start
      await ConnectionService.logExecution(
        request.userId,
        request.platform,
        request.action,
        request.parameters,
        null,
        'pending'
      );

      // Special handling for Pipedream
      if (request.platform === 'pipedream') {
        return await this.executePipedreamRequest(request, connectedPlatforms);
      }

      // Get platform connection details
      const platformConnection = connectedPlatforms.find(p => p.id === request.platform);
      if (!platformConnection) {
        throw new Error(`Platform ${request.platform} is not connected`);
      }

      // Generate code using Groq AI
      const generatedCode = await this.generateCodeForRequest(request, platformConnection);
      
      // Execute the generated code
      const result = await this.executeGeneratedCode(generatedCode, request, platformConnection);
      
      const executionTime = Date.now() - startTime;
      
      // Log successful execution
      await ConnectionService.logExecution(
        request.userId,
        request.platform,
        request.action,
        request.parameters,
        result,
        'success',
        undefined,
        executionTime
      );

      return {
        success: true,
        data: result,
        generatedCode,
        executionLog: `Executed successfully in ${executionTime}ms`
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('MCP Execution Error:', error);
      
      // Log failed execution
      await ConnectionService.logExecution(
        request.userId,
        request.platform,
        request.action,
        request.parameters,
        null,
        'error',
        errorMessage,
        executionTime
      );

      return {
        success: false,
        error: errorMessage,
        executionLog: `Failed after ${executionTime}ms: ${errorMessage}`
      };
    }
  }

  private async executePipedreamRequest(request: McpRequest, connectedPlatforms: Platform[]): Promise<McpResponse> {
    const startTime = Date.now();
    
    try {
      // Get the connected Pipedream accounts
      const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
      const pipedreamConnection = connections.find((c: any) => c.platformId === 'pipedream');
      
      if (!pipedreamConnection && request.action !== 'get_apps') {
        throw new Error('Pipedream is not connected');
      }

      // Execute using Pipedream MCP handler
      const result = await PipedreamMcpHandler.executeRequest({
        action: request.action,
        accountId: pipedreamConnection?.credentials?.accountId,
        app: pipedreamConnection?.credentials?.app,
        parameters: request.parameters,
        userId: request.userId
      });

      const executionTime = Date.now() - startTime;
      
      // Log successful execution
      await ConnectionService.logExecution(
        request.userId,
        request.platform,
        request.action,
        request.parameters,
        result,
        'success',
        undefined,
        executionTime
      );

      return {
        success: true,
        data: result,
        executionLog: `Pipedream action executed successfully in ${executionTime}ms`
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('Pipedream MCP execution error:', error);
      
      // Log failed execution
      await ConnectionService.logExecution(
        request.userId,
        request.platform,
        request.action,
        request.parameters,
        null,
        'error',
        errorMessage,
        executionTime
      );

      return {
        success: false,
        error: errorMessage,
        executionLog: `Pipedream execution failed after ${executionTime}ms: ${errorMessage}`
      };
    }
  }

  private async generateCodeForRequest(request: McpRequest, platform: Platform): Promise<string> {
    const prompt = `You are a code generator for the MCP (Model Context Protocol) server. Generate JavaScript code to fulfill this request:

Platform: ${platform.name} (${request.platform})
Action: ${request.action}
Parameters: ${JSON.stringify(request.parameters, null, 2)}

Requirements:
1. Generate a JavaScript function that performs the requested action
2. Use the provided credentials to authenticate with the platform's API
3. Handle errors gracefully and return meaningful error messages
4. Return the result in a structured format
5. Use fetch() for HTTP requests
6. The code should be executable in a browser environment

Available credentials will be passed as the 'credentials' parameter.
Write only the executable JavaScript code, no explanations.

Example structure:
async function executeAction(credentials, parameters) {
  // Your implementation here
  try {
    // Make API calls using credentials
    const response = await fetch('API_ENDPOINT', {
      headers: {
        'Authorization': 'Bearer ' + credentials.token,
        'Content-Type': 'application/json'
      },
      method: 'GET/POST',
      body: JSON.stringify(parameters)
    });
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`;

    const response = await groqService.generateResponse(prompt, []);
    
    // Extract code from response (remove any markdown formatting)
    let code = response;
    if (code.includes('```javascript')) {
      code = code.split('```javascript')[1].split('```')[0];
    } else if (code.includes('```js')) {
      code = code.split('```js')[1].split('```')[0];
    } else if (code.includes('```')) {
      code = code.split('```')[1].split('```')[0];
    }
    
    return code.trim();
  }

  private async executeGeneratedCode(code: string, request: McpRequest, platform: Platform): Promise<any> {
    // Get platform credentials from localStorage (in a real app, this would be from secure storage)
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === request.platform);
    
    if (!connection) {
      throw new Error(`No connection found for platform: ${request.platform}`);
    }

    try {
      // Create a safe execution environment
      const safeGlobals = {
        fetch,
        console,
        JSON,
        Date,
        Math,
        encodeURIComponent,
        decodeURIComponent,
        btoa,
        atob,
        URLSearchParams,
        URL,
        setTimeout,
        clearTimeout
      };

      // Create function from generated code
      const wrappedCode = `
        (async function() {
          ${code}
          return await executeAction(credentials, parameters);
        })();
      `;

      // Execute in a controlled context
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executor = new AsyncFunction(
        'credentials',
        'parameters', 
        'fetch',
        'console',
        'JSON',
        'Date',
        'Math',
        'encodeURIComponent',
        'decodeURIComponent',
        'btoa',
        'atob',
        'URLSearchParams',
        'URL',
        'setTimeout',
        'clearTimeout',
        `
          ${code}
          return await executeAction(credentials, parameters);
        `
      );

      const result = await executor(
        connection.credentials,
        request.parameters,
        ...Object.values(safeGlobals)
      );

      return result;

    } catch (error) {
      console.error('Code execution error:', error);
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExecutionHistory(userId: string, platformId?: string): Promise<any[]> {
    return await ConnectionService.getExecutionLogs(userId, platformId);
  }
}

export const dynamicMcpServer = DynamicMcpServer.getInstance();
