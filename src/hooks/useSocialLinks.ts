
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SocialNetwork } from '@/types';

export const useSocialLinks = (userId?: string) => {
  const { data: socialLinks, isLoading, error, refetch } = useQuery({
    queryKey: ['social-links', userId],
    queryFn: async () => {
      console.log("Fetching social links for user:", userId);
      
      let query = supabase
        .from('social_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching social links:", error);
        throw error;
      }
      
      console.log("Social links fetched:", data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { socialLinks, isLoading, error, refetch };
};

export const useCreateSocialLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (socialData: {
      platform: SocialNetwork['platform'];
      username: string;
      profile_url: string;
      followers?: number;
      engagement_rate?: number;
    }) => {
      console.log("Creating social link mutation with data:", socialData);
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Current user:", user);
      console.log("Auth error:", authError);
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error("User not authenticated");
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!socialData.platform || !socialData.username || !socialData.profile_url) {
        const missingFields = [];
        if (!socialData.platform) missingFields.push('platform');
        if (!socialData.username) missingFields.push('username');
        if (!socialData.profile_url) missingFields.push('profile_url');
        
        console.error("Missing required fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const insertData = {
        user_id: user.id,
        platform: socialData.platform,
        username: socialData.username,
        profile_url: socialData.profile_url,
        followers: socialData.followers || 0,
        engagement_rate: socialData.engagement_rate || 0,
        is_active: true,
        is_connected: false,
      };

      console.log("Inserting data into social_links:", insertData);

      const { data, error } = await supabase
        .from('social_links')
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error inserting social link:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log("Social link inserted successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Social link creation successful, invalidating queries");
      // Invalidate all social-links queries
      queryClient.invalidateQueries({ 
        queryKey: ['social-links'],
        exact: false 
      });
    },
    onError: (error) => {
      console.error("Social link creation failed:", error);
    }
  });
};

export const useUpdateSocialLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      socialLinkId, 
      data 
    }: { 
      socialLinkId: string; 
      data: Partial<SocialNetwork> 
    }) => {
      console.log("Updating social link:", socialLinkId, data);
      
      const { error } = await supabase
        .from('social_links')
        .update(data)
        .eq('id', socialLinkId);
      
      if (error) {
        console.error("Error updating social link:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Social link update successful, invalidating queries");
      queryClient.invalidateQueries({ 
        queryKey: ['social-links'],
        exact: false 
      });
    },
  });
};

export const useDeleteSocialLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (socialLinkId: string) => {
      console.log("Deleting social link:", socialLinkId);
      
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', socialLinkId);
      
      if (error) {
        console.error("Error deleting social link:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Social link deletion successful, invalidating queries");
      queryClient.invalidateQueries({ 
        queryKey: ['social-links'],
        exact: false 
      });
    },
  });
};
