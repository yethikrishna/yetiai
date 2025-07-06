
import { instagramHandler } from '@/handlers/instagram';
import { Platform, ConnectionConfig } from '@/types/platform';
import { InstagramApiClient } from '@/handlers/instagram/apiClient';
import { InstagramAccount, InstagramPost, InstagramMediaContainer } from '@/types/instagram';

export class InstagramService {
  private static instance: InstagramService | null = null;
  
  private constructor() {}
  
  public static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }
  
  private getApiClient(connectedPlatforms: Platform[]): InstagramApiClient | null {
    const instagramPlatform = connectedPlatforms.find(p => p.id === 'instagram');
    if (!instagramPlatform) return null;
    
    // Get tokens from storage
    const stored = localStorage.getItem('instagram-tokens');
    if (!stored) return null;
    
    try {
      const tokens = JSON.parse(stored);
      return new InstagramApiClient(tokens.pageAccessToken, tokens.instagramAccountId);
    } catch (error) {
      console.error('Error parsing Instagram tokens:', error);
      return null;
    }
  }

  private createConnectionConfig(platform: Platform): ConnectionConfig {
    // Get connection data from storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === platform.id);
    
    return {
      id: `${platform.id}-connection`,
      platformId: platform.id,
      credentials: connection?.credentials || {},
      settings: connection?.settings || {},
      isActive: platform.isConnected
    };
  }
  
  // Account operations
  async getAccountInfo(connectedPlatforms: Platform[]): Promise<InstagramAccount> {
    const client = this.getApiClient(connectedPlatforms);
    if (!client) {
      throw new Error('Instagram not connected');
    }
    
    try {
      return await client.getAccountInfo();
    } catch (error) {
      console.error('Error fetching Instagram account info:', error);
      throw new Error(`Failed to get Instagram account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Post operations
  async getPosts(connectedPlatforms: Platform[], limit: number = 10): Promise<InstagramPost[]> {
    const client = this.getApiClient(connectedPlatforms);
    if (!client) {
      throw new Error('Instagram not connected');
    }
    
    try {
      return await client.getPosts(limit);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      throw new Error(`Failed to get Instagram posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async postImage(connectedPlatforms: Platform[], imageUrl: string, caption?: string): Promise<{ id: string }> {
    const client = this.getApiClient(connectedPlatforms);
    if (!client) {
      throw new Error('Instagram not connected');
    }
    
    try {
      // Create media container
      const container = await client.createMediaContainer(imageUrl, caption);
      
      // Publish the media
      return await client.publishMedia(container.id);
    } catch (error) {
      console.error('Error posting image to Instagram:', error);
      throw new Error(`Failed to post image to Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async postCarousel(
    connectedPlatforms: Platform[], 
    imageUrls: string[], 
    caption?: string
  ): Promise<{ id: string }> {
    const client = this.getApiClient(connectedPlatforms);
    if (!client) {
      throw new Error('Instagram not connected');
    }
    
    if (!imageUrls.length || imageUrls.length < 2) {
      throw new Error('Carousel posts require at least 2 images');
    }
    
    try {
      // Create carousel container with child media
      return await client.createCarouselPost(imageUrls, caption);
    } catch (error) {
      console.error('Error posting carousel to Instagram:', error);
      throw new Error(`Failed to post carousel to Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Connection management
  async connect(
    options: {
      appId: string;
      appSecret: string;
    }
  ): Promise<any> {
    try {
      return await instagramHandler.connect(options);
    } catch (error) {
      console.error('Error connecting Instagram account:', error);
      throw new Error(`Failed to connect Instagram account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async disconnect(platform: Platform): Promise<void> {
    try {
      const connectionConfig = this.createConnectionConfig(platform);
      await instagramHandler.disconnect(connectionConfig);
    } catch (error) {
      console.error('Error disconnecting Instagram account:', error);
      throw new Error(`Failed to disconnect Instagram account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async test(platform: Platform): Promise<any> {
    try {
      const connectionConfig = this.createConnectionConfig(platform);
      return await instagramHandler.test(connectionConfig);
    } catch (error) {
      console.error('Error testing Instagram connection:', error);
      throw new Error(`Failed to test Instagram connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export default InstagramService.getInstance();
