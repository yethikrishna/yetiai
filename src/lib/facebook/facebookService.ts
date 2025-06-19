import { facebookHandler } from '@/handlers/facebook';
import { Platform } from '@/types/platform';
import { FacebookApiClient } from '@/handlers/facebook/apiClient';
import { FacebookPageToken, FacebookPost, FacebookApiResponse } from '@/types/facebook';

export class FacebookService {
  private static instance: FacebookService | null = null;
  private facebookApiClient: FacebookApiClient;
  
  private constructor() {
    this.facebookApiClient = new FacebookApiClient();
  }
  
  public static getInstance(): FacebookService {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }
  
  private getAccessToken(connectedPlatforms: Platform[]): string | null {
    const facebookPlatform = connectedPlatforms.find(p => p.id === 'facebook');
    if (!facebookPlatform) return null;
    
    // In a real app, you'd get this from secure storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === 'facebook');
    return connection?.credentials?.accessToken || null;
  }
  
  private getPageAccessToken(pageId: string): string | null {
    const stored = localStorage.getItem('facebook-pages');
    if (!stored) return null;
    
    try {
      const pages = JSON.parse(stored) as FacebookPageToken[];
      const page = pages.find(p => p.id === pageId);
      return page?.access_token || null;
    } catch (error) {
      console.error('Error parsing Facebook pages:', error);
      return null;
    }
  }
  
  // Authentication and Connection
  async connect(
    options: {
      appId: string;
      appSecret: string;
    }
  ): Promise<any> {
    try {
      return await facebookHandler.connect(options);
    } catch (error) {
      console.error('Error connecting Facebook account:', error);
      throw new Error(`Failed to connect Facebook account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async disconnect(platform: Platform): Promise<void> {
    try {
      await facebookHandler.disconnect(platform);
    } catch (error) {
      console.error('Error disconnecting Facebook account:', error);
      throw new Error(`Failed to disconnect Facebook account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async test(platform: Platform): Promise<any> {
    try {
      return await facebookHandler.test(platform);
    } catch (error) {
      console.error('Error testing Facebook connection:', error);
      throw new Error(`Failed to test Facebook connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Page Operations
  async getUserPages(connectedPlatforms: Platform[]): Promise<FacebookPageToken[]> {
    const accessToken = this.getAccessToken(connectedPlatforms);
    if (!accessToken) {
      throw new Error('Facebook not connected');
    }
    
    try {
      return await this.facebookApiClient.getUserPages(accessToken);
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      throw new Error(`Failed to get Facebook pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Post Operations
  async postToPage(
    connectedPlatforms: Platform[],
    pageId: string,
    message: string,
    imageFile?: File
  ): Promise<FacebookApiResponse> {
    const pageAccessToken = this.getPageAccessToken(pageId);
    if (!pageAccessToken) {
      throw new Error('Page access token not found');
    }
    
    try {
      return await this.facebookApiClient.postToPage(pageId, pageAccessToken, message, imageFile);
    } catch (error) {
      console.error('Error posting to Facebook page:', error);
      throw new Error(`Failed to post to Facebook page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getPagePosts(
    connectedPlatforms: Platform[],
    pageId: string,
    limit: number = 25
  ): Promise<FacebookApiResponse> {
    const pageAccessToken = this.getPageAccessToken(pageId);
    if (!pageAccessToken) {
      throw new Error('Page access token not found');
    }
    
    try {
      return await this.facebookApiClient.getPagePosts(pageId, pageAccessToken, limit);
    } catch (error) {
      console.error('Error fetching Facebook page posts:', error);
      throw new Error(`Failed to get Facebook page posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Comment Operations
  async getPostComments(
    connectedPlatforms: Platform[],
    postId: string,
    pageId: string,
    limit: number = 25
  ): Promise<FacebookApiResponse> {
    const pageAccessToken = this.getPageAccessToken(pageId);
    if (!pageAccessToken) {
      throw new Error('Page access token not found');
    }
    
    try {
      return await this.facebookApiClient.getPostComments(postId, pageAccessToken, limit);
    } catch (error) {
      console.error('Error fetching Facebook post comments:', error);
      throw new Error(`Failed to get Facebook post comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async replyToComment(
    connectedPlatforms: Platform[],
    commentId: string,
    pageId: string,
    message: string
  ): Promise<FacebookApiResponse> {
    const pageAccessToken = this.getPageAccessToken(pageId);
    if (!pageAccessToken) {
      throw new Error('Page access token not found');
    }
    
    try {
      return await this.facebookApiClient.replyToComment(commentId, pageAccessToken, message);
    } catch (error) {
      console.error('Error replying to Facebook comment:', error);
      throw new Error(`Failed to reply to Facebook comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async deletePost(
    connectedPlatforms: Platform[],
    postId: string,
    pageId: string
  ): Promise<FacebookApiResponse> {
    const pageAccessToken = this.getPageAccessToken(pageId);
    if (!pageAccessToken) {
      throw new Error('Page access token not found');
    }
    
    try {
      return await this.facebookApiClient.deletePost(postId, pageAccessToken);
    } catch (error) {
      console.error('Error deleting Facebook post:', error);
      throw new Error(`Failed to delete Facebook post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export default FacebookService.getInstance();
