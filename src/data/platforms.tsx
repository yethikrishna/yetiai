
import { Platform } from "@/types/platform";
import { 
  Github, Twitter, MessageSquare, Mail, Calendar, FileText, 
  Database, Code, Palette, Music, Video, Briefcase, 
  Building, Zap, Bot, Search, Globe, Smartphone,
  Camera, MapPin, ShoppingCart, CreditCard, Users,
  BarChart, Headphones, Book, Gamepad2, Heart,
  Wrench, Shield, Cloud, Server, Cpu
} from "lucide-react";

export const platforms: Platform[] = [
  // Social Media Platforms
  {
    id: 'twitter',
    name: 'Twitter/X',
    category: 'social-media',
    icon: <Twitter size={22} />,
    description: 'Post tweets, read timeline, manage followers',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social-media',
    icon: <Users size={22} />,
    description: 'Manage posts, pages, and social interactions',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'active'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social-media',
    icon: <Camera size={22} />,
    description: 'Share photos, stories, and manage account',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'active'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social-media',
    icon: <Briefcase size={22} />,
    description: 'Professional networking and content sharing',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'entertainment',
    icon: <Video size={22} />,
    description: 'Upload videos, manage channel, analytics',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'search'],
    status: 'active'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social-media',
    icon: <Music size={22} />,
    description: 'Create and share short videos',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'beta'
  },

  // AI Tools
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai-tools',
    icon: <Bot size={22} />,
    description: 'GPT models, DALL-E, and AI capabilities',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['execute'],
    status: 'active'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai-tools',
    icon: <Bot size={22} />,
    description: 'Claude AI assistant and language model',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['execute'],
    status: 'active'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'ai-tools',
    icon: <Cpu size={22} />,
    description: 'Access to thousands of AI models',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['execute', 'search'],
    status: 'active'
  },

  // Development Tools
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: <Github size={22} />,
    description: 'Repository management, issues, pull requests',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'development',
    icon: <Code size={22} />,
    description: 'Git repository and CI/CD management',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'development',
    icon: <Zap size={22} />,
    description: 'Deploy and manage web applications',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'execute'],
    status: 'active'
  },

  // Email Platforms
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    icon: <Mail size={22} />,
    description: 'Email management and automation',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'outlook',
    name: 'Outlook',
    category: 'email',
    icon: <Mail size={22} />,
    description: 'Microsoft email and calendar integration',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'schedule'],
    status: 'active'
  },

  // Productivity Tools
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: <FileText size={22} />,
    description: 'Workspace for notes, docs, and databases',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'productivity',
    icon: <BarChart size={22} />,
    description: 'Project management and team collaboration',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write'],
    status: 'active'
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'productivity',
    icon: <Database size={22} />,
    description: 'Flexible database and spreadsheet hybrid',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write', 'search'],
    status: 'active'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'productivity',
    icon: <Calendar size={22} />,
    description: 'Schedule management and event creation',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'schedule'],
    status: 'active'
  },

  // Workplace Tools
  {
    id: 'slack',
    name: 'Slack',
    category: 'workplace',
    icon: <MessageSquare size={22} />,
    description: 'Team communication and collaboration',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'notify'],
    status: 'active'
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'workplace',
    icon: <Headphones size={22} />,
    description: 'Voice, video, and text communication',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'notify'],
    status: 'active'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'workplace',
    icon: <Building size={22} />,
    description: 'Enterprise collaboration platform',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'schedule'],
    status: 'active'
  },

  // Website Builders
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'website-builders',
    icon: <Globe size={22} />,
    description: 'Content management and website creation',
    isConnected: false,
    requiresAuth: true,
    authType: 'credentials',
    capabilities: ['read', 'write', 'upload'],
    status: 'active'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'website-builders',
    icon: <ShoppingCart size={22} />,
    description: 'E-commerce platform management',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write'],
    status: 'active'
  },

  // File Storage
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'file-storage',
    icon: <Cloud size={22} />,
    description: 'Cloud file storage and sharing',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'active'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'file-storage',
    icon: <Server size={22} />,
    description: 'File synchronization and sharing',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'active'
  },

  // Entertainment & Media
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'entertainment',
    icon: <Music size={22} />,
    description: 'Music streaming and playlist management',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write'],
    status: 'active'
  },
  {
    id: 'twitch',
    name: 'Twitch',
    category: 'entertainment',
    icon: <Video size={22} />,
    description: 'Live streaming platform',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write'],
    status: 'beta'
  },

  // Additional platforms
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'productivity',
    icon: <CreditCard size={22} />,
    description: 'Payment processing and financial data',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['read', 'write'],
    status: 'active'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'productivity',
    icon: <Zap size={22} />,
    description: 'Automation and workflow integration',
    isConnected: false,
    requiresAuth: true,
    authType: 'api-key',
    capabilities: ['execute'],
    status: 'active'
  }
];

export const platformCategories = [
  { id: 'social-media', name: 'Social Media', count: platforms.filter(p => p.category === 'social-media').length },
  { id: 'ai-tools', name: 'AI Tools', count: platforms.filter(p => p.category === 'ai-tools').length },
  { id: 'development', name: 'Development', count: platforms.filter(p => p.category === 'development').length },
  { id: 'email', name: 'Email', count: platforms.filter(p => p.category === 'email').length },
  { id: 'productivity', name: 'Productivity', count: platforms.filter(p => p.category === 'productivity').length },
  { id: 'workplace', name: 'Workplace', count: platforms.filter(p => p.category === 'workplace').length },
  { id: 'website-builders', name: 'Website Builders', count: platforms.filter(p => p.category === 'website-builders').length },
  { id: 'file-storage', name: 'File Storage', count: platforms.filter(p => p.category === 'file-storage').length },
  { id: 'entertainment', name: 'Entertainment', count: platforms.filter(p => p.category === 'entertainment').length }
];
