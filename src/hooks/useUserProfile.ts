/**
 * Hook for managing user profile operations
 * Separated from authentication concerns
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { User } from './useAuth';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) {
      logger.warn('loadProfile called with empty userId');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }

      const userProfile: User = {
        id: data.id,
        email: data.email,
        role: data.role as 'influenceur' | 'commercant' | 'admin',
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        city: data.city,
        avatar_url: data.avatar_url,
        bio: data.bio,
        profile_views: data.profile_views,
        is_verified: data.is_verified,
        created_at: data.created_at,
        updated_at: data.updated_at,
        stripe_account_id: data.stripe_account_id,
        firstName: data.first_name,
        lastName: data.last_name,
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      logger.error('Error loading user profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: Partial<User>) => {
    if (!userId) {
      return { error: { message: 'Aucun utilisateur connecté' } };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      setProfile(prev => prev ? {
        ...prev,
        ...updates,
        firstName: updates.first_name || prev.firstName,
        lastName: updates.last_name || prev.lastName,
      } : null);

      return { error: null, data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inattendue';
      return { error: { message } };
    }
  }, []);

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
  };
};
