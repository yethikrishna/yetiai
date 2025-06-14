
import { Platform } from "@/types/platform";
import { MessageSquare, Headphones, Building } from "lucide-react";

export const workplacePlatforms: Platform[] = [
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
];

