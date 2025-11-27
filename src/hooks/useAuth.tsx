/**
 * Main authentication hook
 * Combines session management and profile operations
 * REFACTORED: Now uses separated concerns
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useUserProfile } from './useUserProfile';
import { useAuthSession } from './useAuthSession';

export interface User {
  id: string;
  email: string;
  role: 'influenceur' | 'commercant' | 'admin';
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  bio: string | null;
  profile_views: number | null;
  is_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  stripe_account_id: string | null;
  // Computed/Frontend-only fields
  firstName?: string | null;
  lastName?: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const { loadProfile, updateProfile: updateUserProfile } = useUserProfile();
  const authSession = useAuthSession();

  useEffect(() => {
    if (initialized) return;

    const initializeAuth = async () => {
      try {
        const session = await authSession.getSession();

        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser(profile);
        }

        setLoading(false);
        setInitialized(true);
      } catch (error) {
        logger.error('Auth initialization error:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        logger.debug('SIGNED_IN event triggered, loading profile...');
        setLoading(true);
        const profile = await loadProfile(session.user.id);
        logger.debug('Profile loaded successfully');
        setUser(profile);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user && !user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, loadProfile, user, authSession]);

  const signIn = async (email: string, password: string) => {
    return authSession.signIn(email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Record<string, string | boolean | undefined>
  ) => {
    return authSession.signUp({ email, password, userData });
  };

  const signOut = async () => {
    await authSession.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      return { error: { message: 'Aucun utilisateur connecté' } };
    }
    return updateUserProfile(user.id, updates);
  };

  const refreshUser = async () => {
    try {
      const session = await authSession.getSession();
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
        return profile;
      }
    } catch (error) {
      logger.error('Error refreshing user:', error);
    }
    return null;
  };

  return {
    user,
    profile: user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    refetchUser: () => {
      if (user?.id) {
        window.location.reload();
      }
    },
  };
};
