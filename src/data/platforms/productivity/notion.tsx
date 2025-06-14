
import { Platform } from "@/types/platform";
import { FileText } from "lucide-react";

export const notion: Platform = {
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
};
