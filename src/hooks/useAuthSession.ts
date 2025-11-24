/**
 * Hook for managing authentication session
 * Handles sign in, sign up, sign out operations
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SignUpData {
  email: string;
  password: string;
  userData: Record<string, string | boolean | undefined>;
}

export const useAuthSession = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      logger.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async ({ email, password, userData }: SignUpData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      return { error, data };
    } catch (error: unknown) {
      logger.error('Error signing up:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      logger.error('Error signing out:', error);
    }
  };

  const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    getSession,
  };
};
