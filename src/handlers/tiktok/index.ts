
import { ConnectionConfig } from '@/types/platform';
import { TikTokApiClient } from './apiClient';
import { TikTokOAuthHandler } from './oauthHandler';

export const tiktokHandler = {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Starting TikTok OAuth flow...');
    
    const { clientId, clientSecret } = credentials;
    
    if (!clientId || !clientSecret) {
      throw new Error('TikTok Client ID and Client Secret are required');
    }

    try {
      const oauthHandler = new TikTokOAuthHandler(clientId, clientSecret);
      const authUrl = oauthHandler.getAuthUrl();
      
      // Store credentials for the callback
      sessionStorage.setItem('tiktok_oauth_credentials', JSON.stringify({ clientId, clientSecret }));
      
      // Redirect to TikTok OAuth
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('TikTok OAuth initiation failed:', error);
      throw new Error(`Failed to start TikTok OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting TikTok...');
    
    try {
      const { clientId, clientSecret, accessToken } = connection.credentials;
      
      if (accessToken && clientId && clientSecret) {
        const oauthHandler = new TikTokOAuthHandler(clientId, clientSecret);
        await oauthHandler.revokeToken(accessToken);
      }
      
      console.log('TikTok disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting TikTok:', error);
      // Don't throw - allow disconnect to continue even if revocation fails
    }
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    console.log('Testing TikTok connection...');
    
    try {
      const { accessToken } = connection.credentials;
      
      if (!accessToken) {
        console.log('No access token found');
        return false;
      }

      const apiClient = new TikTokApiClient(accessToken);
      await apiClient.getUserInfo();
      
      console.log('TikTok connection test successful');
      return true;
    } catch (error) {
      console.error('TikTok connection test failed:', error);
      return false;
    }
  },

  // Additional methods for TikTok-specific operations
  async getUserInfo(connection: ConnectionConfig) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    return apiClient.getUserInfo();
  },

  async getCreatorInfo(connection: ConnectionConfig) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    return apiClient.getCreatorInfo();
  },

  async getVideos(connection: ConnectionConfig, cursor?: string, maxCount: number = 20) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    return apiClient.getVideos(cursor, maxCount);
  },

  async postVideo(connection: ConnectionConfig, videoData: {
    title: string;
    privacy: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
    disableComment?: boolean;
    videoFile: File;
  }) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    
    // Initialize video post
    const initResponse = await apiClient.initVideoPost({
      post_info: {
        privacy_level: videoData.privacy,
        title: videoData.title,
        disable_comment: videoData.disableComment || false,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoData.videoFile.size,
        chunk_size: videoData.videoFile.size,
        total_chunk_count: 1,
      },
    });

    if (initResponse.error) {
      throw new Error(`Failed to initialize video post: ${initResponse.error.message}`);
    }

    // Upload video
    if (initResponse.data.upload_url) {
      const uploadResponse = await apiClient.uploadVideo(
        initResponse.data.upload_url,
        videoData.videoFile,
        `bytes 0-${videoData.videoFile.size - 1}/${videoData.videoFile.size}`
      );

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload video: ${uploadResponse.statusText}`);
      }
    }

    return initResponse.data.publish_id;
  },

  async createDraftVideo(connection: ConnectionConfig, videoUrl: string) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    
    return apiClient.initInboxVideo({
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    });
  },

  async getPublishStatus(connection: ConnectionConfig, publishId: string) {
    const { accessToken } = connection.credentials;
    const apiClient = new TikTokApiClient(accessToken);
    return apiClient.getPublishStatus(publishId);
  },
};
