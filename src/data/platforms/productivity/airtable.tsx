
import { Platform } from "@/types/platform";
import { Database } from "lucide-react";

export const airtable: Platform = {
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
};
