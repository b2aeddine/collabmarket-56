import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  userInitials?: string;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdated, userInitials = "U" }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Récupération de l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Mise à jour du profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdated(publicUrl);
      toast.success("Photo de profil mise à jour !");
      
      // Reset states
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadOptions(false);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Erreur lors de l'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowUploadOptions(false);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadAvatar(selectedFile);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowUploadOptions(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={previewUrl || currentAvatarUrl} alt="Photo de profil" />
          <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
        </Avatar>
        
        {!selectedFile && !showUploadOptions && (
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setShowUploadOptions(true)}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Changer la photo
          </Button>
        )}

        {showUploadOptions && !selectedFile && (
          <div className="space-y-3 w-full max-w-xs">
            <div>
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileSelect}
                className="hidden"
                id="camera-upload"
                disabled={uploading}
              />
              <label
                htmlFor="camera-upload"
                className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Prendre une photo
              </label>
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="gallery-upload"
                disabled={uploading}
              />
              <label
                htmlFor="gallery-upload"
                className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir depuis la galerie
              </label>
            </div>

            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowUploadOptions(false)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}

        {selectedFile && (
          <div className="space-y-3 w-full max-w-xs text-center">
            <p className="text-sm text-gray-600">
              Voulez-vous utiliser cette photo ?
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel} 
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button 
                type="button"
                onClick={handleUpload} 
                disabled={uploading}
              >
                {uploading ? 'Upload...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="text-center text-sm text-gray-600">
            Upload en cours...
          </div>
        )}
      </div>
    </div>
  );
}