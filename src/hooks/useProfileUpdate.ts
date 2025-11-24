import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateProfileParams {
  userId: string;
  profileData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    bio?: string | null;
    company_name?: string | null;
    avatar_url?: string | null;
  };
  categoryIds?: string[];
}

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, profileData, categoryIds }: UpdateProfileParams) => {
      // SECURITY: Verify that the authenticated user can only update their own profile
      // This prevents unauthorized profile modifications (IDOR - Insecure Direct Object Reference)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (user.id !== userId) {
        throw new Error('Unauthorized: You can only update your own profile');
      }

      // 1. Mettre à jour le profil
      const { data: profileUpdateData, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Si des catégories sont fournies, les mettre à jour en une seule transaction
      if (categoryIds && categoryIds.length > 0) {
        // Supprimer les anciennes associations
        const { error: deleteError } = await supabase
          .from('profile_categories')
          .delete()
          .eq('profile_id', userId);

        if (deleteError) {
          console.error('Error deleting old categories:', deleteError);
        }

        // Insérer les nouvelles associations
        const categoryInserts = categoryIds.map(categoryId => ({
          profile_id: userId,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabase
          .from('profile_categories')
          .insert(categoryInserts);

        if (insertError) {
          console.error('Error inserting categories:', insertError);
          throw insertError;
        }
      }

      return { profile: profileUpdateData, categoryIds };
    },
    onSuccess: () => {
      // Invalider toutes les queries pertinentes en une seule fois
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-categories'] });
      toast.success('Profil mis à jour avec succès !');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('Error updating profile:', error);
      toast.error(`Erreur lors de la mise à jour : ${errorMessage}`);
    },
  });
};
