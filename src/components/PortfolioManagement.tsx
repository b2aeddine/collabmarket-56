import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/common/GradientButton";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddPortfolioModal } from "./AddPortfolioModal";
import PortfolioCard from "./PortfolioCard";
import { Plus, Image as ImageIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioManagementProps {
  userId: string;
}

export const PortfolioManagement = ({ userId }: PortfolioManagementProps) => {
  const { portfolioItems, isLoading, deleteItem } = usePortfolio(userId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteItem.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleUpdate = async (updatedItem: any) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({
          title: updatedItem.title,
          description: updatedItem.description,
          link_url: updatedItem.link_url,
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      toast.success("Projet mis à jour avec succès");
      // Le cache sera automatiquement rafraîchi par React Query
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast.error("Erreur lors de la mise à jour du projet");
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">Portfolio</CardTitle>
            <div className="w-full sm:w-auto">
              <GradientButton onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un projet
              </GradientButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg mb-4">Aucun projet dans votre portfolio</p>
              <GradientButton onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier projet
              </GradientButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioItems.map((item) => (
                <PortfolioCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  image_url={item.image_url}
                  link_url={item.link_url}
                  influencer_id={item.influencer_id}
                  created_at={item.created_at}
                  onDelete={() => setDeleteId(item.id)}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPortfolioModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        userId={userId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet sera définitivement
              supprimé de votre portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
