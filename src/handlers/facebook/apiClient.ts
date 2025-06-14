
import { FacebookApiResponse, FacebookPageToken, FacebookPost } from '@/types/facebook';

class FacebookApiClient {
  private readonly graphApiUrl = 'https://graph.facebook.com/v18.0';

  async makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    accessToken: string,
    body?: any,
    files?: { [key: string]: File }
  ): Promise<FacebookApiResponse> {
    const url = `${this.graphApiUrl}${endpoint}`;
    
    const formData = new FormData();
    
    // Add access token
    formData.append('access_token', accessToken);
    
    // Add other form data
    if (body) {
      Object.keys(body).forEach(key => {
        formData.append(key, body[key]);
      });
    }
    
    // Add files
    if (files) {
      Object.keys(files).forEach(key => {
        formData.append(key, files[key]);
      });
    }

    const config: RequestInit = {
      method,
      body: method === 'GET' ? undefined : formData
    };

    // For GET requests, add params to URL
    if (method === 'GET') {
      const params = new URLSearchParams({ access_token: accessToken });
      if (body) {
        Object.keys(body).forEach(key => {
          params.append(key, body[key]);
        });
      }
      const finalUrl = `${url}?${params.toString()}`;
      
      const response = await fetch(finalUrl, { method: 'GET' });
      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('Facebook API Error:', data.error || data);
        throw new Error(data.error?.message || 'Facebook API request failed');
      }

      return data;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Facebook API Error:', data.error || data);
      throw new Error(data.error?.message || 'Facebook API request failed');
    }

    return data;
  }

  async getUserPages(userAccessToken: string): Promise<FacebookPageToken[]> {
    const response = await this.makeApiRequest('/me/accounts', 'GET', userAccessToken);
    return response.data || [];
  }

  async postToPage(
    pageId: string, 
    pageAccessToken: string, 
    message: string, 
    imageFile?: File
  ): Promise<FacebookApiResponse> {
    if (imageFile) {
      // Post with image
      return this.makeApiRequest(
        `/${pageId}/photos`,
        'POST',
        pageAccessToken,
        { message },
        { source: imageFile }
      );
    } else {
      // Post text only
      return this.makeApiRequest(
        `/${pageId}/feed`,
        'POST',
        pageAccessToken,
        { message }
      );
    }
  }

  async getPagePosts(
    pageId: string, 
    pageAccessToken: string, 
    limit: number = 25
  ): Promise<FacebookApiResponse> {
    return this.makeApiRequest(
      `/${pageId}/posts`,
      'GET',
      pageAccessToken,
      { 
        limit: limit.toString(),
        fields: 'id,message,story,created_time,from,likes.summary(true),comments.summary(true)'
      }
    );
  }

  async getPostComments(
    postId: string, 
    pageAccessToken: string, 
    limit: number = 25
  ): Promise<FacebookApiResponse> {
    return this.makeApiRequest(
      `/${postId}/comments`,
      'GET',
      pageAccessToken,
      { 
        limit: limit.toString(),
        fields: 'id,message,created_time,from'
      }
    );
  }

  async replyToComment(
    commentId: string, 
    pageAccessToken: string, 
    message: string
  ): Promise<FacebookApiResponse> {
    return this.makeApiRequest(
      `/${commentId}/comments`,
      'POST',
      pageAccessToken,
      { message }
    );
  }

  async deletePost(
    postId: string, 
    pageAccessToken: string
  ): Promise<FacebookApiResponse> {
    return this.makeApiRequest(
      `/${postId}`,
      'DELETE',
      pageAccessToken
    );
  }

  async getCurrentUser(userAccessToken: string): Promise<FacebookApiResponse> {
    return this.makeApiRequest(
      '/me',
      'GET',
      userAccessToken,
      { fields: 'id,name,email' }
    );
  }
}

export const facebookApiClient = new FacebookApiClient();
