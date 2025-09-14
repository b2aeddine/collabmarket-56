import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStripeIdentity = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createIdentitySession = async () => {
    try {
      setIsLoading(true);
      console.log('Creating Stripe Identity session...');

      // Feedback immédiat à l'utilisateur
      toast.success("Ouverture de la vérification d'identité...");

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Vous devez être connecté pour vérifier votre identité');
      }

      const { data, error } = await supabase.functions.invoke('create-stripe-identity', {
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating identity session:', error);
        const errorMessage = error.message || 'Erreur lors de la création de la session de vérification';
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error('Identity session error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.url) {
        throw new Error('URL de vérification non reçue');
      }

      console.log('Identity session created:', data);
      
      // Ouverture immédiate dans un nouvel onglet
      const newWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        newWindow.focus();
        toast.success("Redirection vers la vérification d'identité réussie !");
      } else {
        // Fallback si le popup est bloqué
        window.location.href = data.url;
      }

      return data;
    } catch (error: any) {
      console.error('Identity verification error:', error);
      toast.error(error.message || "Erreur lors de la création de la session de vérification");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createIdentitySession,
    isLoading,
  };
};