
import { useState, useEffect } from 'react';
import { Platform, ConnectionConfig, PlatformCategory } from '@/types/platform';
import { platforms as allPlatforms } from '@/data/platforms';

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
  };

  const disconnectPlatform = (platformId: string) => {
    const updatedConnections = connections.filter(c => c.platformId !== platformId);
    setConnections(updatedConnections);
    localStorage.setItem('yeti-connections', JSON.stringify(updatedConnections));

    setPlatforms(current =>
      current.map(platform =>
        platform.id === platformId ? { ...platform, isConnected: false } : platform
      )
    );
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
    getPlatformConnection
  };
}
