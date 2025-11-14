import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useContestations = (adminView = false) => {
  const { data: contestations, isLoading, error } = useQuery({
    queryKey: ['contestations', adminView],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('contestations')
        .select(`
          *,
          order:orders(
            id,
            total_amount,
            status,
            offers(title),
            influencer:profiles!orders_influencer_id_fkey(first_name, last_name),
            merchant:profiles!orders_merchant_id_fkey(first_name, last_name, company_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      // Si ce n'est pas la vue admin, filtrer par utilisateur actuel
      if (!adminView) {
        query = query.or(`influencer_id.eq.${user.id},merchant_id.eq.${user.id}`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  return { contestations, isLoading, error };
};

export const useCreateContestation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      orderId,
      raisonContestation,
      preuveInfluenceur
    }: {
      orderId: string;
      raisonContestation: string;
      preuveInfluenceur?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Récupérer les infos de la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('influencer_id, merchant_id')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Créer la contestation
      const { data, error } = await supabase
        .from('contestations')
        .insert([{
          order_id: orderId,
          influencer_id: order.influencer_id,
          merchant_id: order.merchant_id,
          raison_contestation: raisonContestation,
          preuve_influenceur: preuveInfluenceur,
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Mettre à jour le statut de la commande
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'en_contestation',
          date_contestation: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestations'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Contestation créée",
        description: "Votre contestation a été envoyée à l'équipe administrative.",
      });
    },
    onError: (error) => {
      console.error('Error creating contestation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la contestation.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateContestationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      contestationId,
      statut,
      adminDecision,
    }: {
      contestationId: string;
      statut: 'validée' | 'refusée';
      adminDecision: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mettre à jour la contestation
      const { data, error } = await supabase
        .from('contestations')
        .update({
          statut,
          admin_decision: adminDecision,
          admin_decision_date: new Date().toISOString(),
          admin_decision_by: user.id,
        })
        .eq('id', contestationId)
        .select()
        .single();
      
      if (error) throw error;

      // Traiter selon le statut
      if (statut === 'validée') {
        // Annuler la commande et rembourser le commerçant
        console.log('Cancelling order and refunding merchant for order:', data.order_id);
        const { error: cancelError } = await supabase.functions.invoke('cancel-order-and-refund', {
          body: { orderId: data.order_id }
        });

        if (cancelError) {
          console.error('Error cancelling order:', cancelError);
          throw cancelError;
        }
      } else if (statut === 'refusée') {
        // Terminer la commande et payer l'influenceur
        console.log('Completing order and paying influencer for order:', data.order_id);
        const { error: completeError } = await supabase.functions.invoke('complete-order-and-pay', {
          body: { orderId: data.order_id }
        });

        if (completeError) {
          console.error('Error completing order:', completeError);
          throw completeError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestations'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Contestation traitée",
        description: "La décision a été enregistrée.",
      });
    },
    onError: (error) => {
      console.error('Error updating contestation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter la contestation.",
        variant: "destructive"
      });
    },
  });
};