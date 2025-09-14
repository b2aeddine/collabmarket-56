import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  responded_at?: string;
  responded_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useContactMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: messages,
    isLoading,
    error
  } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async (): Promise<ContactMessage[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact messages:", error);
        throw error;
      }

      return data || [];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: isRead })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      toast({
        title: "Statut mis à jour",
        description: "Le message a été marqué comme lu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du message.",
        variant: "destructive",
      });
      console.error("Error updating message status:", error);
    },
  });

  const addAdminNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ 
          admin_notes: notes,
          responded_at: new Date().toISOString(),
          responded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      toast({
        title: "Notes ajoutées",
        description: "Les notes administrateur ont été sauvegardées.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes.",
        variant: "destructive",
      });
      console.error("Error updating admin notes:", error);
    },
  });

  return {
    messages,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    addAdminNotes: addAdminNotesMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isAddingNotes: addAdminNotesMutation.isPending,
  };
};