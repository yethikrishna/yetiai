
import { Platform } from "@/types/platform";
import { Calendar } from "lucide-react";

export const googleCalendar: Platform = {
  id: 'google-calendar',
  name: 'Google Calendar',
  category: 'productivity',
  icon: <Calendar size={22} />,
  description: 'Schedule management and event creation',
  isConnected: false,
  requiresAuth: true,
  authType: 'oauth',
  capabilities: ['read', 'write', 'schedule'],
  status: 'active'
};
