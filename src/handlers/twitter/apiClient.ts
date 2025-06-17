
import { TwitterApiResponse, TwitterTokens } from '@/types/twitter';

class TwitterApiClient {
  async makeApiRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE', 
    accessToken: string, 
    body?: any
  ): Promise<TwitterApiResponse> {
    const url = `https://api.twitter.com${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    const config: RequestInit = {
      method,
      headers
    };

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('Twitter API Error:', data);
      throw new Error(data.detail || data.title || 'Twitter API request failed');
    }

    return data;
  }

  async postTweet(text: string, accessToken: string, mediaIds?: string[]): Promise<TwitterApiResponse> {
    const payload: any = { text };
    if (mediaIds && mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds };
    }

    return this.makeApiRequest('/2/tweets', 'POST', accessToken, payload);
  }

  async getUserTweets(userId: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/users/${userId}/tweets?${params}`, 'GET', accessToken);
  }

  async searchTweets(query: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      query: query,
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/tweets/search/recent?${params}`, 'GET', accessToken);
  }

  async followUser(targetUserId: string, accessToken: string): Promise<TwitterApiResponse> {
    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;
    const payload = { target_user_id: targetUserId };

    return this.makeApiRequest(`/2/users/${sourceUserId}/following`, 'POST', accessToken, payload);
  }

  async unfollowUser(targetUserId: string, accessToken: string): Promise<TwitterApiResponse> {
    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;

    return this.makeApiRequest(`/2/users/${sourceUserId}/following/${targetUserId}`, 'DELETE', accessToken);
  }

  async getUserByUsername(username: string, accessToken: string): Promise<TwitterApiResponse> {
    return this.makeApiRequest(`/2/users/by/username/${username}`, 'GET', accessToken);
  }

  async getCurrentUser(accessToken: string): Promise<TwitterApiResponse> {
    return this.makeApiRequest('/2/users/me', 'GET', accessToken);
  }

  // Enhanced automation methods for Yeti Agent
  async createThread(tweets: string[], accessToken: string): Promise<TwitterApiResponse> {
    console.log('📱 Creating Twitter thread with', tweets.length, 'tweets');
    const results = [];
    let previousTweetId: string | undefined;

    for (let i = 0; i < tweets.length; i++) {
      const payload: any = { text: tweets[i] };
      
      // Reply to previous tweet to create thread
      if (previousTweetId) {
        payload.reply = { in_reply_to_tweet_id: previousTweetId };
      }

      const result = await this.makeApiRequest('/2/tweets', 'POST', accessToken, payload);
      results.push(result);
      
      if (result.data?.id) {
        previousTweetId = result.data.id;
      }

      // Add delay between tweets to avoid rate limits
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { data: results };
  }

  async getDirectMessages(accessToken: string): Promise<TwitterApiResponse> {
    // Note: DM endpoints require special permissions
    return this.makeApiRequest('/2/dm_events', 'GET', accessToken);
  }

  async sendDirectMessage(recipientId: string, text: string, accessToken: string): Promise<TwitterApiResponse> {
    const payload = {
      dm_conversation_id: recipientId,
      text: text
    };

    return this.makeApiRequest('/2/dm_conversations/with/' + recipientId + '/messages', 'POST', accessToken, payload);
  }

  async getMentions(accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    // Get current user first
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const userId = userResponse.data.id;
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics,in_reply_to_user_id'
    });

    return this.makeApiRequest(`/2/users/${userId}/mentions?${params}`, 'GET', accessToken);
  }

  async replyToTweet(tweetId: string, text: string, accessToken: string): Promise<TwitterApiResponse> {
    const payload = {
      text: text,
      reply: { in_reply_to_tweet_id: tweetId }
    };

    return this.makeApiRequest('/2/tweets', 'POST', accessToken, payload);
  }

  async getFollowers(userId: string, accessToken: string, maxResults: number = 100): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'user.fields': 'created_at,description,public_metrics'
    });

    return this.makeApiRequest(`/2/users/${userId}/followers?${params}`, 'GET', accessToken);
  }

  async getFollowing(userId: string, accessToken: string, maxResults: number = 100): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'user.fields': 'created_at,description,public_metrics'
    });

    return this.makeApiRequest(`/2/users/${userId}/following?${params}`, 'GET', accessToken);
  }

  async likeTweet(tweetId: string, accessToken: string): Promise<TwitterApiResponse> {
    // Get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const userId = userResponse.data.id;
    const payload = { tweet_id: tweetId };

    return this.makeApiRequest(`/2/users/${userId}/likes`, 'POST', accessToken, payload);
  }

  async retweetTweet(tweetId: string, accessToken: string): Promise<TwitterApiResponse> {
    // Get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const userId = userResponse.data.id;
    const payload = { tweet_id: tweetId };

    return this.makeApiRequest(`/2/users/${userId}/retweets`, 'POST', accessToken, payload);
  }

  async searchUsers(query: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      query: query,
      max_results: maxResults.toString(),
      'user.fields': 'created_at,description,public_metrics,verified'
    });

    return this.makeApiRequest(`/2/users/search?${params}`, 'GET', accessToken);
  }

  async getTweetsByHashtag(hashtag: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const query = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    return this.searchTweets(query, accessToken, maxResults);
  }

  async autoFollow(criteria: {
    hashtags?: string[];
    keywords?: string[];
    minFollowers?: number;
    maxFollowing?: number;
  }, accessToken: string, maxFollows: number = 10): Promise<TwitterApiResponse> {
    console.log('🤖 Starting auto-follow with criteria:', criteria);
    const results = [];
    let followCount = 0;

    // Search for users based on criteria
    if (criteria.keywords) {
      for (const keyword of criteria.keywords) {
        if (followCount >= maxFollows) break;
        
        const searchResults = await this.searchUsers(keyword, accessToken, 20);
        if (searchResults.data) {
          for (const user of searchResults.data) {
            if (followCount >= maxFollows) break;
            
            // Check criteria
            if (criteria.minFollowers && user.public_metrics.followers_count < criteria.minFollowers) {
              continue;
            }
            if (criteria.maxFollowing && user.public_metrics.following_count > criteria.maxFollowing) {
              continue;
            }

            try {
              const followResult = await this.followUser(user.id, accessToken);
              results.push({ action: 'follow', user: user.username, result: followResult });
              followCount++;
              
              // Rate limit protection
              await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (error) {
              console.warn('Failed to follow user:', user.username, error);
            }
          }
        }
      }
    }

    return { data: results };
  }

  async autoUnfollow(criteria: {
    inactive?: boolean; // Users who haven't tweeted recently
    noFollowBack?: boolean; // Users who don't follow back
    minDaysInactive?: number;
  }, accessToken: string, maxUnfollows: number = 10): Promise<TwitterApiResponse> {
    console.log('🤖 Starting auto-unfollow with criteria:', criteria);
    
    // Get current user
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const userId = userResponse.data.id;
    const results = [];
    let unfollowCount = 0;

    // Get following list
    const following = await this.getFollowing(userId, accessToken, 100);
    if (following.data) {
      for (const user of following.data) {
        if (unfollowCount >= maxUnfollows) break;

        let shouldUnfollow = false;

        // Check inactivity
        if (criteria.inactive) {
          const userTweets = await this.getUserTweets(user.id, accessToken, 5);
          if (!userTweets.data || userTweets.data.length === 0) {
            shouldUnfollow = true;
          } else {
            const lastTweetDate = new Date(userTweets.data[0].created_at);
            const daysSinceLastTweet = (Date.now() - lastTweetDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastTweet > (criteria.minDaysInactive || 30)) {
              shouldUnfollow = true;
            }
          }
        }

        if (shouldUnfollow) {
          try {
            const unfollowResult = await this.unfollowUser(user.id, accessToken);
            results.push({ action: 'unfollow', user: user.username, result: unfollowResult });
            unfollowCount++;
            
            // Rate limit protection
            await new Promise(resolve => setTimeout(resolve, 3000));
          } catch (error) {
            console.warn('Failed to unfollow user:', user.username, error);
          }
        }
      }
    }

    return { data: results };
  }
}

export const twitterApiClient = new TwitterApiClient();
