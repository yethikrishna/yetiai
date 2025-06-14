
import { Platform } from "@/types/platform";
import { FileText, BarChart, Database, Calendar, Zap, CreditCard, Palette, TreePine, Clock, Book } from "lucide-react";

export const productivityPlatforms: Platform[] = [
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
  },
  // OnlyOffice, LibreOffice, Whimsical, MindMeister, Milanote, FigJam, Miro, Pomofocus, Forest, RescueTime, Clockify, Obsidian, Roam, Bear
  {
    id: 'onlyoffice',
    name: 'OnlyOffice',
    category: 'productivity',
    icon: <FileText size={22} />,
    description: 'Docs, spreadsheets, and presentation suite.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'coming-soon',
  },
  {
    id: 'libreoffice',
    name: 'LibreOffice',
    category: 'productivity',
    icon: <FileText size={22} />,
    description: 'Powerful open source office suite.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'coming-soon',
  },
  {
    id: 'whimsical',
    name: 'Whimsical',
    category: 'productivity',
    icon: <Palette size={22} />,
    description: 'Whiteboards, flowcharts, mind maps, and docs.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload'],
    status: 'coming-soon',
  },
  // ... add others in the same pattern ...
];

