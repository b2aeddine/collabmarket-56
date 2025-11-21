import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useProfiles = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          role,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          is_verified,
          is_profile_public,
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
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          profile_views,
          profile_share_count,
          created_at,
          custom_username,
          is_verified,
          role,
          social_links(
            id,
            platform,
            username,
            followers,
            engagement_rate,
            is_active
          ),
          profile_categories(
            category_id,
            categories(
              id,
              name,
              slug
            )
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
        .eq('is_profile_public', true)
        .eq('is_banned', false)
        .limit(20);
      
      if (error) {
        throw error;
      }
      
      // Filtrer les données si nécessaire
      let filteredData = data || [];
      
      if (filters?.category && filters.category !== 'all') {
        filteredData = filteredData.filter(influencer => 
          influencer.profile_categories?.some(pc => 
            pc.categories?.name === filters.category
          )
        );
      }
      
      if (filters?.minFollowers) {
        filteredData = filteredData.filter(influencer => {
          const totalFollowers = influencer.social_links?.reduce((sum, link) => sum + (link.followers || 0), 0) || 0;
          return totalFollowers >= filters.minFollowers;
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
          company_name,
          custom_username,
          is_verified,
          is_profile_public,
          profile_views,
          profile_share_count,
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
          custom_username,
          is_verified,
          profile_views,
          profile_share_count,
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
      
      const { data, error } = await supabase
        .from('profiles')
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
      queryClient.setQueryData(['profile', profileId], (old: any) => {
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
