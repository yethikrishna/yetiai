
import { supabase } from '@/integrations/supabase/client';

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
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingProfile && !fetchError) {
        this.profileCache.set(userId, existingProfile as UserProfile);
        return existingProfile as UserProfile;
      }

      // Create new profile if doesn't exist
      const newProfile = {
        user_id: userId,
        preferences: {
          language: 'en',
          communication_style: 'friendly' as const
        },
        interaction_stats: {
          total_messages: 0,
          favorite_topics: [],
          last_active: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }

      const profile = createdProfile as UserProfile;
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
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return;
      }

      // Update cache
      const cachedProfile = this.profileCache.get(userId);
      if (cachedProfile) {
        this.profileCache.set(userId, { ...cachedProfile, ...updates });
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
