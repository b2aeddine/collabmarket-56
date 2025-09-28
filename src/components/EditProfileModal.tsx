import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, useProfileCategories, useCreateProfileCategory } from "@/hooks/useCategories";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/common/AvatarUpload";
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  avatar?: string;
  bio?: string;
  categories?: string[];
  companyName?: string;
}
interface EditProfileModalProps {
  user: User;
  onSave: (updatedUser: User) => void;
  isOpen?: boolean;
  onClose?: () => void;
}
const EditProfileModal = ({
  user,
  onSave,
  isOpen,
  onClose
}: EditProfileModalProps) => {
  const {
    updateProfile,
    user: currentUser
  } = useAuth();
  const {
    categories
  } = useCategories();
  const {
    profileCategories,
    refetch: refetchProfileCategories
  } = useProfileCategories(user.id);
  const createProfileCategoryMutation = useCreateProfileCategory();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  // Use external control if provided, otherwise use internal state
  const modalIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };
  const handleOpen = () => {
    if (isOpen === undefined) {
      setInternalIsOpen(true);
    }
  };
  useEffect(() => {
    if (profileCategories && profileCategories.length > 0) {
      const categoryIds = profileCategories.map((pc: any) => pc.categories?.id).filter(Boolean) as string[];
      setSelectedCategories(categoryIds);
    } else {
      setSelectedCategories([]);
    }
  }, [profileCategories]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation rapide
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Le prénom, nom et email sont obligatoires");
      return;
    }
    setIsLoading(true);
    try {
      // Optimisation: préparation des données simplifiée
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        city: formData.city?.trim() || null,
        bio: formData.bio?.trim() || null,
        company_name: formData.companyName?.trim() || null,
        avatar_url: formData.avatar || null
      };
      const result = await updateProfile(updateData);
      if (result?.error) {
        toast.error(`Erreur: ${result.error.message}`);
        return;
      }

      // Sauvegarder les catégories sélectionnées
      if (selectedCategories.length > 0) {
        console.log('Saving categories:', selectedCategories);
        await createProfileCategoryMutation.mutateAsync({
          profileId: user.id,
          categoryIds: selectedCategories
        });

        // Rafraîchir les catégories après sauvegarde
        await refetchProfileCategories();
      }

      // Ajouter les catégories sélectionnées aux données utilisateur
      const updatedUserWithCategories = {
        ...formData,
        categories: selectedCategories
      };
      onSave(updatedUserWithCategories);
      handleClose();
      toast.success("Profil et niches mis à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleAddCategory = () => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      setSelectedCategories(prev => [...prev, newCategory]);
      setNewCategory("");
    }
  };
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  };
  const handleAvatarUpdated = (newAvatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
  };
  const getUserInitials = () => {
    return `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`;
  };
  const isCommercant = currentUser?.role === 'commercant';
  return <Dialog open={modalIsOpen} onOpenChange={open => {
    if (!open) {
      handleClose();
    }
  }}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mes informations personnelles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <AvatarUpload currentAvatarUrl={formData.avatar} onAvatarUpdated={handleAvatarUpdated} userInitials={getUserInitials()} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="gender">Sexe</Label>
              <Select value={formData.gender} onValueChange={value => handleSelectChange("gender", value)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                  <SelectItem value="Non précisé">Non précisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCommercant && <div>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleInputChange} placeholder="Nom de votre entreprise" disabled={isLoading} />
            </div>}
          
          <div>
            <Label htmlFor="bio">Biographie courte</Label>
            <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} className="min-h-[80px]" placeholder="Parlez-nous de vous..." disabled={isLoading} />
          </div>

          {/* Section Niches/Catégories */}
          <div className="space-y-4">
            <Label>Niches / Catégories</Label>
            
            <div className="flex gap-2">
              <Select value={newCategory} onValueChange={setNewCategory} disabled={isLoading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter(cat => !selectedCategories.includes(cat.id)).map(category => <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddCategory} disabled={!newCategory || isLoading}>
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
              {selectedCategories.length === 0 ? <span className="text-sm text-gray-500">Aucune catégorie sélectionnée</span> : selectedCategories.map(categoryId => {
              const category = categories?.find(c => c.id === categoryId);
              return <Badge key={categoryId} variant="default" className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                      {category?.name}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-200" onClick={() => handleRemoveCategory(categoryId)} />
                    </Badge>;
            })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleClose()} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default EditProfileModal;