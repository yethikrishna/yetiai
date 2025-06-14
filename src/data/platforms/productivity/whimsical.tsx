
import { Platform } from "@/types/platform";
import { Palette } from "lucide-react";

export const whimsical: Platform = {
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
};
