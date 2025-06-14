
import { Platform } from "@/types/platform";
import { BarChart } from "lucide-react";

export const trello: Platform = {
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
};
