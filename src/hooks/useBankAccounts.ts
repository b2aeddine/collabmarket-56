import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BankAccount {
  id: string;
  iban: string;
  bic?: string;
  account_holder: string;
  bank_name?: string;
  is_default: boolean;
  is_active: boolean;
}

export const useBankAccounts = () => {
  const queryClient = useQueryClient();

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const addBankAccount = useMutation({
    mutationFn: async (bankAccount: Omit<BankAccount, 'id' | 'is_active'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.user.id,
          iban: bankAccount.iban,
          bic: bankAccount.bic || '',
          account_holder: bankAccount.account_holder,
          bank_name: bankAccount.bank_name || '',
          is_default: bankAccount.is_default,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Compte bancaire ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error adding bank account:', error);
      toast.error('Erreur lors de l\'ajout du compte bancaire');
    },
  });

  const updateBankAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Compte bancaire mis à jour');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error updating bank account:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteBankAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Compte bancaire supprimé');
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error deleting bank account:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    bankAccounts,
    isLoading,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
  };
};