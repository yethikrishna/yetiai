
import { Platform } from "@/types/platform";
import { Zap } from "lucide-react";

export const zapier: Platform = {
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
};
