import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/GradientButton";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddPortfolioModal } from "./AddPortfolioModal";
import { Plus, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
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

  const handleVisitLink = (url: string) => {
    if (url) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
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
                <div key={item.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <OptimizedImage
                      src={item.image_url}
                      alt={item.title || "Portfolio item"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="mt-2 space-y-2">
                    {item.title && (
                      <p className="text-sm font-medium line-clamp-1">
                        {item.title}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.link_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisitLink(item.link_url!)}
                        className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Voir le projet
                      </Button>
                    )}
                  </div>
                </div>
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
