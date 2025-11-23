import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, X, SlidersHorizontal, TrendingUp, Star, DollarSign, Users, MapPin } from "lucide-react";
import { SearchFilters } from "@/hooks/useAdvancedSearch";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  activeFiltersCount: number;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onSortChange: (sortBy: SearchFilters['sortBy']) => void;
  onReset: () => void;
  resultCount: number;
}

const niches = ["Lifestyle", "Tech", "Food", "Fitness", "Travel", "Beauty", "Gaming", "Fashion", "Music", "Art"];
const cities = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Rennes"];
const platforms = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Snapchat"];

const AdvancedFilters = memo(({
  filters,
  activeFiltersCount,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onReset,
  resultCount,
}: AdvancedFiltersProps) => {
  const removeFilter = (filterKey: keyof SearchFilters) => {
    onFiltersChange({ [filterKey]: undefined });
  };

  const togglePlatform = (platform: string) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    onFiltersChange({ platforms: newPlatforms.length > 0 ? newPlatforms : undefined });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Rechercher par nom, bio, catégorie..."
                value={filters.searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Select value={filters.sortBy || 'relevance'} onValueChange={(value) => onSortChange(value as SearchFilters['sortBy'])}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Pertinence
                  </div>
                </SelectItem>
                <SelectItem value="popularity">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Popularité
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Note
                  </div>
                </SelectItem>
                <SelectItem value="price_low">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Prix croissant
                  </div>
                </SelectItem>
                <SelectItem value="price_high">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Prix décroissant
                  </div>
                </SelectItem>
                <SelectItem value="engagement">Taux d'engagement</SelectItem>
                <SelectItem value="recent">Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Filtres actifs ({activeFiltersCount}):</span>
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {filters.searchTerm}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('searchTerm')} />
                </Badge>
              )}
              {filters.niche && (
                <Badge variant="secondary" className="gap-1">
                  Niche: {filters.niche}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('niche')} />
                </Badge>
              )}
              {(filters.minBudget !== undefined || filters.maxBudget !== undefined) && (
                <Badge variant="secondary" className="gap-1">
                  Budget: {filters.minBudget || 0}€ - {filters.maxBudget || '∞'}€
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    removeFilter('minBudget');
                    removeFilter('maxBudget');
                  }} />
                </Badge>
              )}
              {(filters.minFollowers !== undefined || filters.maxFollowers !== undefined) && (
                <Badge variant="secondary" className="gap-1">
                  Followers: {filters.minFollowers || 0} - {filters.maxFollowers || '∞'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    removeFilter('minFollowers');
                    removeFilter('maxFollowers');
                  }} />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="secondary" className="gap-1">
                  Ville: {filters.city}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('city')} />
                </Badge>
              )}
              {filters.minEngagement !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  Engagement: ≥{filters.minEngagement}%
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('minEngagement')} />
                </Badge>
              )}
              {filters.platforms && filters.platforms.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Plateformes: {filters.platforms.join(', ')}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('platforms')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onReset} className="h-6">
                Réinitialiser tout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Accordion */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="filters" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Filtres avancés</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-2">{activeFiltersCount}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {/* Niche */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Niche</label>
                    <Select value={filters.niche || 'all'} onValueChange={(value) => onFiltersChange({ niche: value === 'all' ? undefined : value })}>
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
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget (€)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minBudget || ''}
                        onChange={(e) => onFiltersChange({ minBudget: e.target.value ? Number(e.target.value) : undefined })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBudget || ''}
                        onChange={(e) => onFiltersChange({ maxBudget: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  {/* Followers Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Followers
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minFollowers || ''}
                        onChange={(e) => onFiltersChange({ minFollowers: e.target.value ? Number(e.target.value) : undefined })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxFollowers || ''}
                        onChange={(e) => onFiltersChange({ maxFollowers: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ville
                    </label>
                    <Select value={filters.city || 'all'} onValueChange={(value) => onFiltersChange({ city: value === 'all' ? undefined : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les villes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les villes</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Engagement Rate */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Taux d'engagement min (%)</label>
                    <Input
                      type="number"
                      placeholder="Ex: 5"
                      value={filters.minEngagement || ''}
                      onChange={(e) => onFiltersChange({ minEngagement: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plateformes</label>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map((platform) => (
                        <Badge
                          key={platform}
                          variant={filters.platforms?.includes(platform) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => togglePlatform(platform)}
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {resultCount} influenceur{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
      </div>
    </div>
  );
});

AdvancedFilters.displayName = 'AdvancedFilters';

export default AdvancedFilters;