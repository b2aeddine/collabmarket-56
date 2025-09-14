import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  bank_accounts: {
    iban: string;
    account_holder: string;
    bank_name?: string;
  };
}

export const useWithdrawals = () => {
  const queryClient = useQueryClient();

  const createWithdrawal = useMutation({
    mutationFn: async ({ amount, bankAccountId }: { amount: number; bankAccountId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Utilisateur non connecté');

      // Vérifier le solde disponible
      const { data: balance } = await supabase.rpc('get_influencer_available_balance', {
        user_id: user.user.id
      });

      if (Number(balance) < amount) {
        throw new Error('Solde insuffisant');
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          influencer_id: user.user.id,
          bank_account_id: bankAccountId,
          amount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Demande de retrait créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-balance'] });
    },
    onError: (error) => {
      console.error('Error creating withdrawal:', error);
      toast.error(error.message || 'Erreur lors de la création de la demande');
    },
  });

  return {
    createWithdrawal,
  };
};

// Hook pour les admins
export const useAdminWithdrawals = () => {
  const queryClient = useQueryClient();

  const { data: withdrawalRequests, isLoading } = useQuery({
    queryKey: ['admin-withdrawal-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          bank_accounts!withdrawal_requests_bank_account_id_fkey (
            iban,
            account_holder,
            bank_name,
            bic
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Récupérer les profils des influenceurs séparément
      const influencerIds = data.map(w => w.influencer_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', influencerIds);

      if (profilesError) throw profilesError;

      // Joindre les données
      const enrichedData = data.map(withdrawal => ({
        ...withdrawal,
        profiles: profiles.find(p => p.id === withdrawal.influencer_id)
      }));

      return enrichedData;
    },
  });

  const updateWithdrawalStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminNotes 
    }: { 
      id: string; 
      status: 'approved' | 'rejected' | 'paid'; 
      adminNotes?: string 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: user.user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Statut de la demande mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawal-requests'] });
    },
    onError: (error) => {
      console.error('Error updating withdrawal status:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  return {
    withdrawalRequests,
    isLoading,
    updateWithdrawalStatus,
  };
};