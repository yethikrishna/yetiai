
import { Platform } from "@/types/platform";
import { FileText } from "lucide-react";

export const onlyoffice: Platform = {
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
};
