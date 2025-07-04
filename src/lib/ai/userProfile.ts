import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    interests?: string[];
    communication_style?: 'formal' | 'casual' | 'friendly';
  };
  basic_info?: {
    location?: string;
    profession?: string;
    age_range?: string;
  };
  interaction_stats?: {
    total_messages: number;
    favorite_topics: string[];
    last_active: string;
  };
  created_at: string;
  updated_at: string;
}

// Type for the raw Supabase user_profiles row (disabled since table doesn't exist)
type UserProfileRow = any;

// Helper function to safely convert JSONB to typed objects
function parseJsonField<T>(field: any, fallback: T): T {
  if (!field) return fallback;
  if (typeof field === 'object') return field as T;
  try {
    return JSON.parse(field) as T;
  } catch {
    return fallback;
  }
}

// Helper function to convert Supabase row to UserProfile
function convertToUserProfile(data: UserProfileRow): UserProfile {
  return {
    id: data?.id || crypto.randomUUID(),
    user_id: data?.user_id || '',
    name: data?.name || undefined,
    preferences: parseJsonField(data?.preferences, {}),
    basic_info: parseJsonField(data?.basic_info, {}),
    interaction_stats: parseJsonField(data?.interaction_stats, {
      total_messages: 0,
      favorite_topics: [],
      last_active: new Date().toISOString()
    }),
    created_at: data?.created_at || new Date().toISOString(),
    updated_at: data?.updated_at || new Date().toISOString()
  };
}

class UserProfileService {
  private static instance: UserProfileService;
  private profileCache: Map<string, UserProfile> = new Map();

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  async getOrCreateProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;

    // Check cache first
    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId)!;
    }

    try {
      // Since user_profiles table doesn't exist yet, create a default profile
      console.log('Creating default profile for user:', userId);
      
      const profile: UserProfile = {
        id: crypto.randomUUID(),
        user_id: userId,
        preferences: {
          language: 'en',
          communication_style: 'friendly'
        },
        interaction_stats: {
          total_messages: 0,
          favorite_topics: [],
          last_active: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.profileCache.set(userId, profile);
      return profile;

    } catch (error) {
      console.error('Error managing user profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!userId) return;

    try {
      // Since user_profiles table doesn't exist yet, just update cache
      console.log('Would update profile for user:', userId, updates);

      // Update cache
      const cachedProfile = this.profileCache.get(userId);
      if (cachedProfile) {
        this.profileCache.set(userId, { 
          ...cachedProfile, 
          ...updates,
          updated_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  async incrementMessageCount(userId: string): Promise<void> {
    if (!userId) return;

    const profile = await this.getOrCreateProfile(userId);
    if (!profile) return;

    const updatedStats = {
      ...profile.interaction_stats,
      total_messages: (profile.interaction_stats?.total_messages || 0) + 1,
      last_active: new Date().toISOString()
    };

    await this.updateProfile(userId, {
      interaction_stats: updatedStats
    });
  }

  async addFavoriteTopic(userId: string, topic: string): Promise<void> {
    if (!userId || !topic) return;

    const profile = await this.getOrCreateProfile(userId);
    if (!profile) return;

    const currentTopics = profile.interaction_stats?.favorite_topics || [];
    const updatedTopics = [...new Set([...currentTopics, topic])].slice(0, 10); // Keep top 10

    await this.updateProfile(userId, {
      interaction_stats: {
        ...profile.interaction_stats,
        favorite_topics: updatedTopics,
        last_active: new Date().toISOString()
      }
    });
  }

  buildProfileContext(profile: UserProfile | null): string {
    if (!profile) return '';

    let context = '\n\n=== USER CONTEXT ===\n';
    
    if (profile.name) {
      context += `User's name: ${profile.name}\n`;
    }

    if (profile.preferences?.language && profile.preferences.language !== 'en') {
      context += `Preferred language: ${profile.preferences.language}\n`;
    }

    if (profile.preferences?.communication_style) {
      context += `Communication style: ${profile.preferences.communication_style}\n`;
    }

    if (profile.basic_info?.profession) {
      context += `Profession: ${profile.basic_info.profession}\n`;
    }

    if (profile.basic_info?.location) {
      context += `Location: ${profile.basic_info.location}\n`;
    }

    if (profile.interaction_stats?.favorite_topics?.length) {
      context += `Interests: ${profile.interaction_stats.favorite_topics.join(', ')}\n`;
    }

    if (profile.interaction_stats?.total_messages) {
      context += `Total conversations: ${profile.interaction_stats.total_messages}\n`;
    }

    context += '=== END USER CONTEXT ===\n\n';
    context += 'Use this context to personalize your responses and remember the user\'s preferences.';

    return context;
  }
}

export const userProfileService = UserProfileService.getInstance();
