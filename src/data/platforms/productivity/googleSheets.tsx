import { Platform } from "@/types/platform";
import { FileSpreadsheet } from "lucide-react";

export const googleSheets: Platform = {
  id: 'google-sheets',
  name: 'Google Sheets',
  category: 'productivity',
  icon: <FileSpreadsheet size={22} />,
  description: 'Create and manage spreadsheets online',
  isConnected: false,
  requiresAuth: true,
  authType: 'oauth',
  capabilities: ['read', 'write'],
  status: 'active'
};
