import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SocialNetworkCard from "./SocialNetworkCard";
import AddSocialNetworkModal from "./AddSocialNetworkModal";
import EditSocialNetworkModal from "./EditSocialNetworkModal";
import { useSocialLinks, useUpdateSocialLink, useDeleteSocialLink } from "@/hooks/useSocialLinks";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SocialNetworkManagerProps {
  userId: string;
}

const SocialNetworkManager = ({ userId }: SocialNetworkManagerProps) => {
  const { socialLinks, isLoading } = useSocialLinks(userId);
  const updateSocialLink = useUpdateSocialLink();
  const deleteSocialLink = useDeleteSocialLink();
  
  const [editingLink, setEditingLink] = useState<{ id?: string; platform: string; username: string; profile_url: string; followers: number; engagement_rate: number } | null>(null);

  const validateAndFormatUrl = (url: string): string | null => {
    if (!url || url.trim() === '') return null;
    
    let formattedUrl = url.trim();
    
    // Ajouter https:// si pas de protocole
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // Validation basique d'URL
    try {
      new URL(formattedUrl);
      return formattedUrl;
    } catch {
      return null;
    }
  };

  const constructProfileUrl = (platform: string, username: string): string => {
    const baseUrls: { [key: string]: string } = {
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/@',
      youtube: 'https://youtube.com/@',
      twitter: 'https://twitter.com/',
      x: 'https://x.com/',
      linkedin: 'https://linkedin.com/in/',
      facebook: 'https://facebook.com/'
    };

    const baseUrl = baseUrls[platform.toLowerCase()];
    if (!baseUrl) return username;

    // Nettoyer le username
    // eslint-disable-next-line no-useless-escape
    const cleanUsername = username.replace(/[@\/]/g, '');
    return baseUrl + cleanUsername;
  };

  const handleEditNetwork = async (data: { profile_url?: string; username?: string; platform?: string; followers?: number; engagement_rate?: number }) => {
    if (!editingLink) return;

    try {
      // Valider et formater l'URL
      let finalUrl = data.profile_url;
      
      if (!finalUrl && data.username && data.platform) {
        finalUrl = constructProfileUrl(data.platform, data.username);
      }
      
      const validatedUrl = validateAndFormatUrl(finalUrl);
      if (!validatedUrl) {
        toast.error("Veuillez fournir un lien valide");
        return;
      }

      const networkData = {
        platform: data.platform,
        username: data.username,
        profile_url: validatedUrl,
        followers: parseInt(data.followers) || 0,
        engagement_rate: parseFloat(data.engagement_rate) || 0,
        is_active: data.is_active !== undefined ? data.is_active : true
      };

      await updateSocialLink.mutateAsync({ 
        socialLinkId: editingLink.id, 
        data: networkData 
      });
      setEditingLink(null);
      toast.success("Réseau social mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du réseau social:", error);
      toast.error("Erreur lors de la mise à jour du réseau social");
    }
  };

  const handleDeleteNetwork = async (id: string) => {
    try {
      await deleteSocialLink.mutateAsync(id);
      toast.success("Réseau social supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du réseau social:", error);
      toast.error("Erreur lors de la suppression du réseau social");
    }
  };

  const _handleVisitProfile = (url: string) => {
    const validatedUrl = validateAndFormatUrl(url);
    if (validatedUrl) {
      window.open(validatedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("Lien invalide");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Réseaux sociaux</CardTitle>
        <AddSocialNetworkModal />
      </CardHeader>
      <CardContent>
        {socialLinks && socialLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialLinks.map((link) => (
              <SocialNetworkCard 
                key={link.id}
                id={link.id}
                platform={link.platform}
                username={link.username}
                profile_url={link.profile_url}
                followers={link.followers || 0}
                engagement_rate={link.engagement_rate || 0}
                is_connected={link.is_connected}
                is_active={link.is_active}
                onToggleActive={() => {}}
                onDelete={() => handleDeleteNetwork(link.id)}
                onUpdateNetwork={(updatedNetwork) => handleEditNetwork(updatedNetwork)}
                user_id={link.user_id}
                created_at={link.created_at}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Aucun réseau social ajouté pour le moment
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialNetworkManager;
