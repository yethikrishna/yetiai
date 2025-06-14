
import { Platform } from "@/types/platform";
import { Cloud, Server } from "lucide-react";

export const fileStoragePlatforms: Platform[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'file-storage',
    icon: <Cloud size={22} />,
    description: 'Cloud file storage and sharing',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'active'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'file-storage',
    icon: <Server size={22} />,
    description: 'File synchronization and sharing',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'active'
  },
  // Mega, iCloud
  {
    id: 'mega',
    name: 'Mega',
    category: 'file-storage',
    icon: <Cloud size={22} />,
    description: 'Secure encrypted cloud storage.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'coming-soon',
  },
  {
    id: 'icloud',
    name: 'iCloud',
    category: 'file-storage',
    icon: <Cloud size={22} />,
    description: 'Apple cloud service for files, photos, and mail.',
    isConnected: false,
    requiresAuth: true,
    authType: 'oauth',
    capabilities: ['read', 'write', 'upload', 'download'],
    status: 'coming-soon',
  },
];

