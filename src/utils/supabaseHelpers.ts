
import { supabase } from '@/integrations/supabase/client';

// Helper pour uploader des images de profil
export const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Helper pour vérifier si un utilisateur peut effectuer une action
export const checkUserPermission = async (requiredRole: 'commercant' | 'influenceur') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === requiredRole;
};

// Helper pour formatter les montants en euros
export const formatEuro = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Helper pour calculer le taux d'engagement
export const calculateEngagementRate = (interactions: number, followers: number): number => {
  if (followers === 0) return 0;
  return Math.round((interactions / followers) * 100 * 100) / 100; // 2 decimal places
};

// Helper pour valider un IBAN
export const validateIBAN = (iban: string): boolean => {
  // Supprime les espaces et convertit en majuscules
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Vérifie le format basique (longueur et caractères)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
    return false;
  }
  
  // Vérifie la longueur selon le pays (simplifié pour la France)
  if (cleanIban.startsWith('FR') && cleanIban.length !== 27) {
    return false;
  }
  
  return true;
};

// Helper pour formater un IBAN avec des espaces
export const formatIBAN = (iban: string): string => {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  return cleanIban.replace(/(.{4})/g, '$1 ').trim();
};

// Helper pour obtenir l'icône d'une plateforme sociale
export const getPlatformIcon = (platform: string) => {
  const icons = {
    instagram: 'Instagram',
    tiktok: 'Music',
    snapchat: 'Ghost',
    x: 'Twitter',
    youtube: 'Youtube'
  };
  return icons[platform as keyof typeof icons] || 'Globe';
};

// Helper pour obtenir la couleur d'une plateforme sociale
export const getPlatformColor = (platform: string) => {
  const colors = {
    instagram: 'from-pink-500 to-purple-600',
    tiktok: 'from-black to-gray-800',
    snapchat: 'from-yellow-400 to-yellow-600',
    x: 'from-blue-400 to-blue-600',
    youtube: 'from-red-500 to-red-700'
  };
  return colors[platform as keyof typeof colors] || 'from-gray-400 to-gray-600';
};
