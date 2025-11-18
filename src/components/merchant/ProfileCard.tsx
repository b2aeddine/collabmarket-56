
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileModal from "@/components/EditProfileModal";
import { User, Building, Mail, MapPin } from "lucide-react";
import { useProfileCategories, useCreateProfileCategory } from "@/hooks/useCategories";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

interface ProfileCardProps {
  profile: any;
  user: any;
  onSaveProfile: (updatedUser: any) => Promise<void>;
}

const ProfileCard = ({ profile, user, onSaveProfile }: ProfileCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { profileCategories, isLoading: categoriesLoading, refetch: refetchCategories } = useProfileCategories(profile?.id);
  const createProfileCategoryMutation = useCreateProfileCategory();
  const queryClient = useQueryClient();

  const modalUser = user ? {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email,
    phone: user.phone || '',
    city: user.city || '',
    gender: '',
    avatar: user.avatar_url,
    bio: user.bio,
    companyName: user.company_name || '',
  } : null;

  const handleSaveProfile = async (updatedUser: any) => {
    try {
      // La fonction parent gère la sauvegarde du profil de base et affiche le toast
      await onSaveProfile(updatedUser);
      
      // Si des catégories sont sélectionnées, les sauvegarder
      if (updatedUser.selectedCategories && updatedUser.selectedCategories.length > 0) {
        await createProfileCategoryMutation.mutateAsync({
          profileId: profile.id,
          categoryIds: updatedUser.selectedCategories,
        });
        
        // Recharger uniquement les catégories (l'invalidation est déjà gérée par la mutation)
        await refetchCategories();
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <>
      <Card className="shadow-xl border-0">
        <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback className="text-2xl">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {categoriesLoading ? (
                <Badge variant="secondary" className="text-xs">
                  Chargement des niches...
                </Badge>
              ) : profileCategories && profileCategories.length > 0 ? (
                profileCategories.map((categoryItem: any) => (
                  <Badge 
                    key={categoryItem.id} 
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs"
                  >
                    {categoryItem.categories?.name || 'Catégorie inconnue'}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Aucune niche sélectionnée
                </Badge>
              )}
            </div>

            <h2 className="text-xl font-bold mb-2">{profile.first_name} {profile.last_name}</h2>
            
            <div className="flex flex-col items-center gap-2 text-gray-600 mb-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {profile.city && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.city}</span>
                </div>
              )}
              {profile.company_name && (
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.company_name}</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-600 text-sm mb-3">{profile.bio}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Modal */}
    {modalUser && (
      <EditProfileModal 
        user={modalUser} 
        onSave={handleSaveProfile} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    )}
    </>
  );
};

export default ProfileCard;
