
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  profile_views?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  company_name?: string;
  custom_username?: string;
  is_profile_public?: boolean;
  profile_share_count?: number;
  // Stripe Identity fields
  stripe_identity_session_id?: string;
  stripe_identity_status?: string;
  stripe_identity_url?: string;
  identity_status?: string;
  // Add aliases for compatibility with EditProfileModal
  firstName?: string;
  lastName?: string;
  gender?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fonction pour charger le profil utilisateur (déplacée hors du useEffect)
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        city: data.city,
        avatar_url: data.avatar_url,
        bio: data.bio,
        date_of_birth: data.date_of_birth,
        profile_views: data.profile_views,
        is_verified: data.is_verified,
        created_at: data.created_at,
        updated_at: data.updated_at,
        company_name: data.company_name,
        custom_username: data.custom_username,
        is_profile_public: data.is_profile_public,
        profile_share_count: data.profile_share_count,
        stripe_identity_session_id: data.stripe_identity_session_id,
        stripe_identity_status: data.stripe_identity_status,
        stripe_identity_url: data.stripe_identity_url,
        identity_status: data.identity_status,
        firstName: data.first_name,
        lastName: data.last_name,
        gender: undefined,
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    if (initialized) return; // Éviter les réinitialisations multiples

    // Initialisation une seule fois
    const initializeAuth = async () => {
      try {
        // Vérifier la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setUser(profile);
        }
        
        setLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('SIGNED_IN event triggered, loading profile...');
        setLoading(true);
        const profile = await loadUserProfile(session.user.id);
        console.log('Profile loaded:', profile);
        setUser(profile);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user && !user) {
        const profile = await loadUserProfile(session.user.id);
        setUser(profile);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Redirection automatique désactivée pour éviter les boucles infinies
  // Les redirections sont maintenant gérées dans les pages Login/Signup

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
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
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      return { error: { message: 'Aucun utilisateur connecté' } };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        ...updates,
        firstName: updates.first_name || prev.firstName,
        lastName: updates.last_name || prev.lastName,
      } : null);
      
      return { error: null, data };
    } catch (error: any) {
      return { error: { message: error.message || 'Erreur inattendue' } };
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        setUser(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  };

  return {
    user,
    profile: user, // Alias pour la compatibilité
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    refetchUser: () => {
      // Fonction de rechargement simplifiée
      if (user?.id) {
        window.location.reload();
      }
    },
  };
};
