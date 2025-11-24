
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRevenues = () => {
  const { data: revenues, isLoading, error } = useQuery({
    queryKey: ['revenues'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ useRevenues: No authenticated user');
        return [];
      }

      console.log('💰 Fetching revenues for user:', user.id);

      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          orders(
            id,
            total_amount,
            merchant:profiles!orders_merchant_id_fkey(first_name, last_name)
          )
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ useRevenues error:', error);
        throw error;
      }

      console.log('✅ Revenues loaded:', data?.length || 0);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
  });

  return { revenues, isLoading, error };
};

export const useAvailableBalance = () => {
  const { data: balance, isLoading, error } = useQuery({
    queryKey: ['available-balance'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      // Pour l'instant, on calcule le solde disponible comme la somme des revenus avec status 'available'
      const { data, error } = await supabase
        .from('revenues')
        .select('net_amount')
        .eq('influencer_id', user.user.id)
        .eq('status', 'available');
      
      if (error) throw error;
      
      const total = data?.reduce((sum, revenue) => sum + Number(revenue.net_amount), 0) || 0;
      return total;
    },
  });

  return { balance, isLoading, error };
};

export const useBankAccounts = () => {
  const { data: bankAccounts, isLoading, error } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ useBankAccounts: No authenticated user');
        return [];
      }

      console.log('🏦 Fetching bank accounts for user:', user.id);

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      
      if (error) {
        console.error('❌ useBankAccounts error:', error);
        throw error;
      }

      console.log('✅ Bank accounts loaded:', data?.length || 0);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  return { bankAccounts, isLoading, error };
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bankData: {
      iban: string;
      bic: string;
      account_holder: string;
      bank_name: string;
      is_default?: boolean;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{
          ...bankData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawalData: {
      bank_account_id: string;
      amount: number;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          ...withdrawalData,
          influencer_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
};

export const useWithdrawals = () => {
  const { data: withdrawals, isLoading, error } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ useWithdrawals: No authenticated user');
        return [];
      }

      console.log('💸 Fetching withdrawals for user:', user.id);

      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          bank_accounts(bank_name, account_holder)
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ useWithdrawals error:', error);
        throw error;
      }

      console.log('✅ Withdrawals loaded:', data?.length || 0);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { withdrawals, isLoading, error };
};
