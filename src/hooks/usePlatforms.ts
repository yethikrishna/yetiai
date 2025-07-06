import { useState, useEffect } from 'react';
import { Platform, ConnectionConfig, PlatformCategory } from '@/types/platform';
import { platforms as allPlatforms } from '@/data/platforms';
import { getPlatformHandler, isPlatformSupported } from '@/handlers/platformHandlers';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

// Helper function to safely convert Json to Record<string, string>
const jsonToStringRecord = (json: any): Record<string, string> => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(json)) {
      result[key] = String(value);
    }
    return result;
  }
  return {};
};

// Helper function to safely convert Json to Record<string, any>
const jsonToRecord = (json: any): Record<string, any> => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    return json as Record<string, any>;
  }
  return {};
};

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  // Initialize platforms and load connections from Supabase
  useEffect(() => {
    const initializePlatforms = async () => {
      try {
        console.log('Initializing platforms...');
        
        // Initialize platforms
        setPlatforms(allPlatforms || []);
        
        // Load connections from Supabase if user is authenticated
        if (user) {
          await loadConnectionsFromSupabase();
        } else {
          // Fallback to localStorage for unauthenticated users
          loadConnectionsFromLocalStorage();
        }
        
        setIsLoading(false);
        console.log('Platforms initialized successfully');
      } catch (error) {
        console.error('Error initializing platforms:', error);
        setIsLoading(false);
      }
    };

    initializePlatforms();
  }, [user]);

  const loadConnectionsFromSupabase = async () => {
    if (!user) return;

    try {
      // Since user_connections table doesn't exist yet, fallback to localStorage
      console.log('Supabase user_connections table not available, using localStorage');
      loadConnectionsFromLocalStorage();
    } catch (error) {
      console.error('Error loading connections from Supabase:', error);
      // Fallback to localStorage
      loadConnectionsFromLocalStorage();
    }
  };

  const loadConnectionsFromLocalStorage = () => {
    try {
      const savedConnections = localStorage.getItem('yeti-connections');
      if (savedConnections) {
        const parsedConnections = JSON.parse(savedConnections);
        setConnections(parsedConnections);
        
        // Update platform connection status
        setPlatforms(current => 
          current.map(platform => ({
            ...platform,
            isConnected: parsedConnections.some((conn: ConnectionConfig) => 
              conn.platformId === platform.id && conn.isActive
            )
          }))
        );
      }
    } catch (error) {
      console.error('Error loading connections from localStorage:', error);
    }
  };

  const connectPlatform = async (platformId: string, credentials: Record<string, string>) => {
    console.log(`Attempting to connect platform: ${platformId}`);
    
    // Check if platform is supported in Phase 1
    if (!isPlatformSupported(platformId)) {
      throw new Error(`${platformId} connection will be available in a future release.`);
    }

    const handler = getPlatformHandler(platformId);
    if (!handler) {
      throw new Error(`No handler found for platform: ${platformId}`);
    }

    try {
      const success = await handler.connect(credentials);
      
      if (success) {
        const newConnection: ConnectionConfig = {
          id: crypto.randomUUID(),
          platformId,
          credentials,
          settings: {},
          lastConnected: new Date(),
          isActive: true
        };

        // Save to Supabase if user is authenticated
        if (user) {
          await saveConnectionToSupabase(newConnection);
        } else {
          // Fallback to localStorage
          const updatedConnections = [...connections.filter(c => c.platformId !== platformId), newConnection];
          setConnections(updatedConnections);
          localStorage.setItem('yeti-connections', JSON.stringify(updatedConnections));
        }

        // Update platform status
        setPlatforms(current =>
          current.map(platform =>
            platform.id === platformId ? { ...platform, isConnected: true } : platform
          )
        );

        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Connection failed for ${platformId}:`, error);
      throw error;
    }
  };

  const saveConnectionToSupabase = async (connection: ConnectionConfig) => {
    if (!user) return;

    try {
      // Since user_connections table doesn't exist yet, save to localStorage
      console.log('Supabase user_connections table not available, using localStorage');
      const updatedConnections = [...connections.filter(c => c.platformId !== connection.platformId), connection];
      setConnections(updatedConnections);
      localStorage.setItem('yeti-connections', JSON.stringify(updatedConnections));

      toast({
        title: "Connection Saved",
        description: "Your platform connection has been stored locally.",
      });
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    console.log(`Disconnecting platform: ${platformId}`);
    
    if (isPlatformSupported(platformId)) {
      const handler = getPlatformHandler(platformId);
      const connection = connections.find(c => c.platformId === platformId);
      
      if (handler && connection) {
        try {
          await handler.disconnect(connection);
        } catch (error) {
          console.error(`Disconnect failed for ${platformId}:`, error);
        }
      }
    }

    // Since user_connections table doesn't exist yet, just update localStorage
    if (user) {
      console.log('Supabase user_connections table not available, using localStorage');
    }

    // Update local state
    const updatedConnections = connections.filter(c => c.platformId !== platformId);
    setConnections(updatedConnections);
    
    // Also update localStorage as fallback
    localStorage.setItem('yeti-connections', JSON.stringify(updatedConnections));

    setPlatforms(current =>
      current.map(platform =>
        platform.id === platformId ? { ...platform, isConnected: false } : platform
      )
    );
  };

  const testConnection = async (platformId: string): Promise<boolean> => {
    if (!isPlatformSupported(platformId)) {
      return false;
    }

    const handler = getPlatformHandler(platformId);
    const connection = connections.find(c => c.platformId === platformId && c.isActive);
    
    if (!handler || !connection) {
      return false;
    }

    try {
      return await handler.test(connection);
    } catch (error) {
      console.error(`Connection test failed for ${platformId}:`, error);
      return false;
    }
  };

  const logExecution = async (platformId: string, action: string, requestData: any, responseData: any, status: 'success' | 'error' | 'pending', errorMessage?: string, executionTimeMs?: number) => {
    if (!user) return;

    try {
      // Since mcp_execution_logs table doesn't exist yet, just log to console
      console.log('Execution log:', { platformId, action, status, errorMessage, executionTimeMs });
    } catch (error) {
      console.error('Error logging execution:', error);
    }
  };

  const getFilteredPlatforms = () => {
    if (selectedCategory === 'all') return platforms;
    return platforms.filter(platform => platform.category === selectedCategory);
  };

  const getConnectedPlatforms = () => {
    return platforms.filter(platform => platform.isConnected);
  };

  const getPlatformConnection = (platformId: string) => {
    return connections.find(conn => conn.platformId === platformId && conn.isActive);
  };

  return {
    platforms: getFilteredPlatforms(),
    allPlatforms: platforms,
    connectedPlatforms: getConnectedPlatforms(),
    connections,
    selectedCategory,
    setSelectedCategory,
    connectPlatform,
    disconnectPlatform,
    testConnection,
    getPlatformConnection,
    isPlatformSupported,
    isLoading,
    logExecution
  };
}
