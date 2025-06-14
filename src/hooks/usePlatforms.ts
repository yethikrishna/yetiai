
import { useState, useEffect } from 'react';
import { Platform, ConnectionConfig, PlatformCategory } from '@/types/platform';
import { platforms as allPlatforms } from '@/data/platforms';
import { getPlatformHandler, isPlatformSupported } from '@/handlers/platformHandlers';

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>(allPlatforms);
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | 'all'>('all');

  // Load connections from localStorage
  useEffect(() => {
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
  }, []);

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
          platformId,
          credentials,
          settings: {},
          lastConnected: new Date(),
          isActive: true
        };

        const updatedConnections = [...connections.filter(c => c.platformId !== platformId), newConnection];
        setConnections(updatedConnections);
        localStorage.setItem('yeti-connections', JSON.stringify(updatedConnections));

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

    const updatedConnections = connections.filter(c => c.platformId !== platformId);
    setConnections(updatedConnections);
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
    isPlatformSupported
  };
}
