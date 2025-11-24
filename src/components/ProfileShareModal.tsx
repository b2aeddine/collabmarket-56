
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Instagram, MessageCircle, Twitter, Check } from "lucide-react";
import { toast } from "sonner";

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  customUsername?: string;
  isPublic: boolean;
}

const ProfileShareModal = ({ isOpen, onClose, profileId, customUsername, isPublic }: ProfileShareModalProps) => {
  const [copied, setCopied] = useState(false);
  
  // Générer l'URL de partage
  const baseUrl = window.location.origin;
  const shareUrl = customUsername 
    ? `${baseUrl}/i/${customUsername}`
    : `${baseUrl}/influencer/${profileId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié ✅");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const handleShareInstagram = () => {
    const text = `Découvrez mon profil d'influenceur : ${shareUrl}`;
    const instagramUrl = `https://www.instagram.com/direct/new/?text=${encodeURIComponent(text)}`;
    window.open(instagramUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = `Découvrez mon profil d'influenceur : ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Découvrez mon profil d'influenceur`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  if (!isPublic) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">🔒 Profil privé</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Votre profil doit être public pour pouvoir le partager.
            </p>
            <p className="text-sm text-gray-500">
              Activez l'option "Rendre mon profil public" dans vos paramètres pour débloquer le partage.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🚀 Partager mon profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL de partage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Lien de votre profil
            </label>
            <div className="flex space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Boutons de partage */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Partager directement
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                className="flex items-center justify-center gap-3 h-12 hover:bg-green-50 hover:border-green-200"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>WhatsApp</span>
              </Button>
              
              <Button
                onClick={handleShareInstagram}
                variant="outline"
                className="flex items-center justify-center gap-3 h-12 hover:bg-pink-50 hover:border-pink-200"
              >
                <Instagram className="w-5 h-5 text-pink-600" />
                <span>Instagram DM</span>
              </Button>
              
              <Button
                onClick={handleShareTwitter}
                variant="outline"
                className="flex items-center justify-center gap-3 h-12 hover:bg-blue-50 hover:border-blue-200"
              >
                <Twitter className="w-5 h-5 text-blue-600" />
                <span>Twitter</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileShareModal;
