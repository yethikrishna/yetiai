
import { Platform } from "@/types/platform";
import { Github, Globe, Package, Zap, Database, GitBranch, Workflow } from "lucide-react";

export const developmentPlatforms: Platform[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: <Github className="w-full h-full text-gray-900" />,
    description: 'Version control and collaboration platform for developers.',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    category: 'development',
    icon: <Globe className="w-full h-full text-gray-900" />,
    description: 'Host static websites directly from GitHub repositories.',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'development',
    icon: <Zap className="w-full h-full text-black" />,
    description: 'Deploy and host modern web applications with ease.',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'development',
    icon: <Package className="w-full h-full text-teal-600" />,
    description: 'Build, deploy, and manage modern web projects.',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'development',
    icon: <Database className="w-full h-full text-orange-500" />,
    description: 'Google\'s platform for building mobile and web applications.',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
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
