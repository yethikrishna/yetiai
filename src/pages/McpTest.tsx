
import { McpTestPanel } from '@/components/McpTestPanel';
import { AuthWrapper } from '@/components/AuthWrapper';

const McpTest = () => {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">MCP Dynamic Server Test</h1>
            <p className="text-slate-600 mt-2">
              Test the Model Context Protocol server that uses AI to generate and execute code for platform interactions.
            </p>
          </div>
          
          <McpTestPanel />
        </div>
      </div>
    </AuthWrapper>
  );
};

export default McpTest;
