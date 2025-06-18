
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from './use-toast';
import { pipedreamService } from '@/lib/pipedream/pipedreamService';
import { usePipedreamMcp } from './usePipedreamMcp';

export interface PipedreamApp {
  name: string;
  name_slug: string;
  auth_type?: string;
  categories?: string[];
  description?: string;
  logo_url?: string;
  custom_fields_json?: any;
}

export interface ConnectedApp {
  id: string;
  app: string;
  name: string;
  email?: string;
  username?: string;
  external_user_id: string;
  created_at: string;
  updated_at: string;
}

export function usePipedreamApps() {
  const [apps, setApps] = useState<PipedreamApp[]>([]);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();
  const { loadAccounts } = usePipedreamMcp();

  const loadApps = async (category?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load available apps from Pipedream
      const availableApps = await pipedreamService.getAvailableApps();
      
      // Filter by category if specified
      let filteredApps = availableApps;
      if (category && category !== 'all') {
        filteredApps = availableApps.filter(app => 
          app.categories?.some(cat => 
            cat.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      setApps(filteredApps);
      
      // Load connected accounts if user is authenticated
      if (user) {
        await loadConnectedApps();
      }
    } catch (error) {
      console.error('Failed to load Pipedream apps:', error);
      setError('Failed to load applications');
      toast({
        title: "Loading Failed",
        description: "Failed to load available applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectedApps = async () => {
    if (!user) return;

    try {
      const accounts = await loadAccounts();
      setConnectedApps(accounts || []);
    } catch (error) {
      console.error('Failed to load connected apps:', error);
    }
  };

  const searchApps = async (query: string, category?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all apps first
      const allApps = await pipedreamService.getAvailableApps();
      
      // Filter by search query and category
      let filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.name_slug.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      if (category && category !== 'all') {
        filteredApps = filteredApps.filter(app => 
          app.categories?.some(cat => 
            cat.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      setApps(filteredApps);
    } catch (error) {
      console.error('Failed to search Pipedream apps:', error);
      setError('Failed to search applications');
      toast({
        title: "Search Failed",
        description: "Failed to search applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConnectedApps = async () => {
    if (user) {
      await loadConnectedApps();
    }
  };

  const getAppBySlug = (slug: string) => {
    return apps.find(app => app.name_slug === slug);
  };

  const isAppConnected = (appSlug: string) => {
    return connectedApps.some(connected => connected.app === appSlug);
  };

  return {
    apps,
    connectedApps,
    isLoading,
    error,
    loadApps,
    loadConnectedApps,
    searchApps,
    refreshConnectedApps,
    getAppBySlug,
    isAppConnected
  };
}
