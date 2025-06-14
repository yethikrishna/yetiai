
import { Platform } from "@/types/platform";
import { CreditCard } from "lucide-react";

export const stripe: Platform = {
  id: 'stripe',
  name: 'Stripe',
  category: 'productivity',
  icon: <CreditCard size={22} />,
  description: 'Payment processing and financial data',
  isConnected: false,
  requiresAuth: true,
  authType: 'api-key',
  capabilities: ['read', 'write'],
  status: 'active'
};
