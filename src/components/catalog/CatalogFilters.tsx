import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface CatalogFiltersProps {
  searchTerm: string;
  selectedNiche: string;
  selectedBudget: string;
  selectedFollowers: string;
  onSearchChange: (value: string) => void;
  onNicheChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onFollowersChange: (value: string) => void;
}

const niches = ["Lifestyle", "Tech", "Food", "Fitness", "Travel", "Beauty", "Gaming", "Fashion", "Music", "Art"];

// Memoized filters component to prevent re-renders on parent changes
const CatalogFilters = memo(({
  searchTerm,
  selectedNiche,
  selectedBudget,
  selectedFollowers,
  onSearchChange,
  onNicheChange,
  onBudgetChange,
  onFollowersChange,
}: CatalogFiltersProps) => {
  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtres de recherche</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un influenceur..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedNiche} onValueChange={onNicheChange}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les niches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les niches</SelectItem>
              {niches.map((niche) => (
                <SelectItem key={niche} value={niche}>{niche}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBudget} onValueChange={onBudgetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les budgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les budgets</SelectItem>
              <SelectItem value="0-100">0€ - 100€</SelectItem>
              <SelectItem value="100-200">100€ - 200€</SelectItem>
              <SelectItem value="200+">200€+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFollowers} onValueChange={onFollowersChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les followers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les followers</SelectItem>
              <SelectItem value="0-30k">0 - 30k</SelectItem>
              <SelectItem value="30k-50k">30k - 50k</SelectItem>
              <SelectItem value="50k+">50k+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

CatalogFilters.displayName = 'CatalogFilters';

export default CatalogFilters;