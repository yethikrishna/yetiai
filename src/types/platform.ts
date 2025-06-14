
export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  requiresAuth: boolean;
  authType: 'oauth' | 'api-key' | 'credentials';
  capabilities: PlatformCapability[];
  status: 'active' | 'coming-soon' | 'beta';
}

export type PlatformCategory = 
  | 'social-media'
  | 'ai-tools' 
  | 'productivity'
  | 'development'
  | 'email'
  | 'entertainment'
  | 'workplace'
  | 'website-builders'
  | 'file-storage';

export type PlatformCapability = 
  | 'read'
  | 'write'
  | 'execute'
  | 'search'
  | 'upload'
  | 'download'
  | 'notify'
  | 'schedule';

export interface PlatformAction {
  id: string;
  platformId: string;
  name: string;
  description: string;
  parameters: ActionParameter[];
  capability: PlatformCapability;
}

export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'date';
  required: boolean;
  description: string;
  default?: any;
}

export interface ConnectionConfig {
  platformId: string;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  lastConnected?: Date;
  isActive: boolean;
}
