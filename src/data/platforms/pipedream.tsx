
import { Platform } from "@/types/platform";
import { Workflow, GitBranch } from "lucide-react";

export const pipedreamPlatforms: Platform[] = [
  {
    id: 'pipedream',
    name: 'Pipedream',
    category: 'development',
    icon: <Workflow className="w-full h-full text-orange-600" />,
    description: 'Connect APIs and automate workflows with 2500+ integrations and serverless code.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'execute', 'search'],
    status: 'active'
  }
];
