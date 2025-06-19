import { Platform } from "@/types/platform";
import { FileText } from "lucide-react";

export const googleDocs: Platform = {
  id: 'google-docs',
  name: 'Google Docs',
  category: 'productivity',
  icon: <FileText size={22} />,
  description: 'Create and edit documents online',
  isConnected: false,
  requiresAuth: true,
  authType: 'oauth',
  capabilities: ['read', 'write'],
  status: 'active'
};
