import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface AddPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AddPortfolioModal = ({
  open,
  onOpenChange,
  userId,
}: AddPortfolioModalProps) => {
  const { uploadImage, addItem } = usePortfolio(userId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage(selectedFile, userId);
      await addItem.mutateAsync({
        image_url: imageUrl,
        title: title || undefined,
        description: description || undefined,
        link_url: linkUrl || undefined,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error adding portfolio item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setLinkUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un projet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Image *</Label>
            {!preview ? (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    Cliquez pour télécharger une image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG jusqu'à 5MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="title">Titre (optionnel)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du projet"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="link">Lien (optionnel)</Label>
            <Input
              id="link"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
