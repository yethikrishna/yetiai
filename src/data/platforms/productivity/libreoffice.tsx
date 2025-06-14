
import { Platform } from "@/types/platform";
import { FileText } from "lucide-react";

export const libreoffice: Platform = {
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
};
