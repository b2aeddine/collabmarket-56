

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook pour récupérer toutes les catégories actives
export const useCategories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return data || [];
    },
  });

  return { categories, isLoading, error };
};

// Hook pour créer/mettre à jour les catégories d'un profil
export const useCreateProfileCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, categoryIds }: { profileId: string; categoryIds: string[] }) => {
      console.log('Creating profile categories:', { profileId, categoryIds });
      
      // Supprimer les anciennes catégories
      const { error: deleteError } = await supabase
        .from('profile_categories')
        .delete()
        .eq('profile_id', profileId);
      
      if (deleteError) {
        console.error('Error deleting old categories:', deleteError);
        throw deleteError;
      }
      
      // Ajouter les nouvelles catégories
      if (categoryIds.length > 0) {
        const insertData = categoryIds.map(categoryId => ({
          profile_id: profileId,
          category_id: categoryId
        }));
        
        const { error: insertError } = await supabase
          .from('profile_categories')
          .insert(insertData);
        
        if (insertError) {
          console.error('Error creating profile categories:', insertError);
          throw insertError;
        }
      }
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['profile-categories', variables.profileId] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

// Hook pour récupérer les catégories d'un profil spécifique
export const useProfileCategories = (profileId: string) => {
  const { data: profileCategories, isLoading, error, refetch } = useQuery({
    queryKey: ['profile-categories', profileId],
    queryFn: async () => {
      console.log('Fetching profile categories for:', profileId);
      const { data, error } = await supabase
        .from('profile_categories')
        .select(`
          id,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('profile_id', profileId);
      
      if (error) {
        console.error('Error fetching profile categories:', error);
        throw error;
      }
      
      console.log('Profile categories fetched:', data);
      return data || [];
    },
    enabled: !!profileId,
  });

  return { profileCategories, isLoading, error, refetch };
};

