
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, X } from "lucide-react";
import { toast } from "sonner";

interface CategorySelectorProps {
  currentCategories?: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const CategorySelector = ({ currentCategories = [], onCategoriesChange }: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories);
  const [newCategory, setNewCategory] = useState("");

  const availableCategories = [
    "Tech & Gaming",
    "Beauté & Mode", 
    "Fitness & Sport",
    "Food & Cooking",
    "Travel & Adventure",
    "Lifestyle",
    "Music",
    "Art & Design",
    "Business",
    "Education"
  ];

  const handleAddCategory = () => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      const updated = [...selectedCategories, newCategory];
      setSelectedCategories(updated);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    const updated = selectedCategories.filter(c => c !== category);
    setSelectedCategories(updated);
  };

  const handleSave = () => {
    onCategoriesChange(selectedCategories);
    setIsOpen(false);
    toast.success("Catégories mises à jour avec succès !");
  };

  return (
    <div className="space-y-2">
      <Label>Niches / Catégories</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {currentCategories.map((category) => (
          <Badge key={category} variant="secondary" className="text-xs">
            {category}
          </Badge>
        ))}
        {currentCategories.length === 0 && (
          <span className="text-sm text-gray-500">Aucune catégorie sélectionnée</span>
        )}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Modifier les catégories
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gérer mes catégories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Ajouter une catégorie</Label>
              <div className="flex gap-2 mt-2">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories
                      .filter(cat => !selectedCategories.includes(cat))
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCategory} disabled={!newCategory}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div>
              <Label>Catégories sélectionnées</Label>
              <div className="flex flex-wrap gap-2 mt-2 min-h-[60px] p-3 border rounded-md">
                {selectedCategories.length === 0 ? (
                  <span className="text-sm text-gray-500">Aucune catégorie sélectionnée</span>
                ) : (
                  selectedCategories.map((category) => (
                    <Badge key={category} variant="default" className="flex items-center gap-1">
                      {category}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveCategory(category)}
                      />
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90">
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelector;
