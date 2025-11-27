import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useProfiles = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_profiles')
        .select(`
          id,
          role,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          is_verified,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Pagination - limit to 50 profiles

      if (error) {
        throw error;
      }
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for profiles
  });

  return { profiles, isLoading, error };
};

export const useInfluencers = (filters?: { category?: string; minFollowers?: number }) => {
  const { data: influencers, isLoading, error } = useQuery({
    queryKey: ['influencers', filters],
    queryFn: async () => {
      // Direct query that works for both authenticated and anonymous users
      const { data, error } = await supabase
        .from('public_profiles')
        .select(`
          id,
          role,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          is_verified,
          profile_views,
          created_at,
          social_links(
            id,
            platform,
            username,
            followers,
            engagement_rate,
            is_active
          ),
          offers(
            id,
            title,
            price,
            is_active
          )
        `)
        .eq('role', 'influenceur')
        .eq('is_verified', true)
        .limit(20);

      if (error) {
        throw error;
      }

      // Filtrer les données si nécessaire
      let filteredData = data || [];

      // Note: Category filtering removed since profile_categories not accessible from public_profiles view
      if (filters?.category && filters.category !== 'all') {
        // Cannot filter by category from public_profiles view
        console.warn('Category filtering not available for public profiles view');
      }

      if (filters?.minFollowers !== undefined && filters.minFollowers > 0) {
        filteredData = filteredData.filter((influencer: any) => {
          const totalFollowers = influencer.social_links?.reduce((sum: number, link: any) => sum + (link.followers || 0), 0) || 0;
          return totalFollowers >= (filters.minFollowers || 0);
        });
      }

      return filteredData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for influencer list
  });

  return { influencers, isLoading, error };
};

export const useProfile = (profileId: string) => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }

      // Get current user to determine access level
      const { data: { user } } = await supabase.auth.getUser();
      const isOwnProfile = user?.id === profileId;

      // Check if user is admin
      let isAdmin = false;
      if (user) {
        const { data: adminCheck } = await supabase.rpc('is_current_user_admin');
        isAdmin = adminCheck || false;
      }

      let selectQuery = '';

      if (isOwnProfile || isAdmin) {
        // Full access for own profile or admin
        selectQuery = `
          id,
          email,
          role,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          phone,
          is_verified,
          profile_views,
          created_at,
          social_links(
            id,
            platform,
            username,
            profile_url,
            followers,
            engagement_rate,
            is_active
          ),
          offers(
            id,
            title,
            description,
            price,
            delivery_time,
            is_active,
            is_popular
          ),
          profile_categories(
            categories(
              id,
              name,
              slug,
              icon_name
            )
          )
        `;
      } else {
        // Limited access for public viewing - only safe columns
        selectQuery = `
          id,
          role,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          is_verified,
          profile_views,
          created_at,
          social_links(
            id,
            platform,
            username,
            profile_url,
            followers,
            engagement_rate,
            is_active
          ),
          offers(
            id,
            title,
            description,
            price,
            delivery_time,
            is_active,
            is_popular
          ),
          profile_categories(
            categories(
              id,
              name,
              slug,
              icon_name
            )
          )
        `;
      }

      // Use profiles for own/admin, public_profiles for others
      const tableName = (isOwnProfile || isAdmin) ? 'profiles' as const : 'public_profiles' as const;

      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!profileId,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual profiles
  });

  return { profile, isLoading, error };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, data }: { profileId: string; data: Partial<User> }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, { profileId }) => {
      // Targeted invalidation instead of broad invalidation
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
};

export const useIncrementProfileViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId }: { profileId: string }) => {
      // Simple optimized update instead of RPC
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('profile_views')
        .eq('id', profileId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const currentViews = currentProfile?.profile_views || 0;

      const { error } = await supabase
        .from('profiles')
        .update({
          profile_views: currentViews + 1
        })
        .eq('id', profileId);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, { profileId }) => {
      // Update the cache optimistically
      queryClient.setQueryData(['profile', profileId], (old: User | undefined) => {
        if (old) {
          return {
            ...old,
            profile_views: (old.profile_views || 0) + 1
          };
        }
        return old;
      });
    },
  });
};
