
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@/hooks/useAuth';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: User | null;
  onProfileUpdate: () => void;
}

const ProfileSettingsModal = ({ isOpen, onClose, profile, onProfileUpdate }: ProfileSettingsModalProps) => {
  const [customUsername, setCustomUsername] = useState(profile?.custom_username || '');
  const [isPublic, setIsPublic] = useState(profile?.is_profile_public || false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCustomUsername(profile.custom_username || '');
      setIsPublic(profile.is_profile_public || false);
    }
  }, [profile]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    // Vérifier le format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setIsUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('custom_username', username)
        .neq('id', profile.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Aucun résultat trouvé, le nom d'utilisateur est disponible
        setIsUsernameAvailable(true);
      } else if (data) {
        // Un résultat trouvé, le nom d'utilisateur est pris
        setIsUsernameAvailable(false);
      }
    } catch (_error) {
      console.error('Erreur lors de la vérification:', error);
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customUsername !== profile?.custom_username) {
        checkUsernameAvailability(customUsername);
      } else {
        setIsUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [customUsername, profile?.custom_username, checkUsernameAvailability]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updates: { is_profile_public: boolean; custom_username?: string } = {
        is_profile_public: isPublic,
      };

      // Ajouter le custom_username seulement s'il est valide
      if (customUsername && isUsernameAvailable) {
        updates.custom_username = customUsername;
      } else if (!customUsername) {
        updates.custom_username = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Paramètres mis à jour avec succès ✅");
      onProfileUpdate();
      onClose();
    } catch (_error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const getUsernameStatus = () => {
    if (!customUsername) return null;
    if (isCheckingUsername) return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
    if (isUsernameAvailable === true) return <Check className="w-4 h-4 text-green-600" />;
    if (isUsernameAvailable === false) return <X className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getUsernameMessage = () => {
    if (!customUsername) return "Laissez vide pour utiliser l'URL par défaut";
    if (customUsername.length < 3) return "Minimum 3 caractères";
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(customUsername)) return "Seules les lettres, chiffres et _ sont autorisés";
    if (isCheckingUsername) return "Vérification...";
    if (isUsernameAvailable === true) return "✅ Nom d'utilisateur disponible";
    if (isUsernameAvailable === false) return "❌ Nom d'utilisateur déjà pris";
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⚙️ Paramètres de partage</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Switch pour rendre le profil public */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-profile" className="text-sm font-medium">
                Rendre mon profil public
              </Label>
              <p className="text-sm text-gray-500">
                Permet aux autres de voir votre profil
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Nom d'utilisateur personnalisé */}
          <div className="space-y-2">
            <Label htmlFor="custom-username" className="text-sm font-medium">
              Nom d'utilisateur personnalisé
            </Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="custom-username"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="mon_nom_utilisateur"
                  className="pr-10"
                />
              </div>
              <div className="flex items-center justify-center w-6">
                {getUsernameStatus()}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {getUsernameMessage()}
            </p>
            {customUsername && (
              <p className="text-xs text-blue-600">
                URL: {window.location.origin}/i/{customUsername}
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || (customUsername && isUsernameAvailable !== true && customUsername !== profile?.custom_username)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal;
