import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PortfolioItem {
  id: string;
  influencer_id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePortfolio = (influencerId?: string) => {
  const queryClient = useQueryClient();

  const { data: portfolioItems = [], isLoading } = useQuery({
    queryKey: ["portfolio", influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("influencer_id", influencerId || '')
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PortfolioItem[];
    },
    enabled: !!influencerId,
  });

  const uploadImage = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;

    const { error: uploadError, data: _data } = await supabase.storage
      .from("portfolio")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("portfolio")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addItem = useMutation({
    mutationFn: async (newItem: {
      image_url: string;
      title?: string;
      description?: string;
      link_url?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const maxOrder = portfolioItems.reduce(
        (max, item) => Math.max(max, item.display_order),
        -1
      );

      const { data, error } = await supabase
        .from("portfolio_items")
        .insert({
          ...newItem,
          influencer_id: userData.user.id,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Élément ajouté au portfolio");
    },
    onError: (error) => {
      console.error("Error adding portfolio item:", error);
      toast.error("Erreur lors de l'ajout au portfolio");
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PortfolioItem>;
    }) => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Portfolio mis à jour");
    },
    onError: (error) => {
      console.error("Error updating portfolio item:", error);
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Élément supprimé du portfolio");
    },
    onError: (error) => {
      console.error("Error deleting portfolio item:", error);
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    portfolioItems,
    isLoading,
    uploadImage,
    addItem,
    updateItem,
    deleteItem,
  };
};
