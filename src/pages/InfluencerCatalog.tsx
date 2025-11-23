import { memo } from "react";
import Header from "@/components/Header";
import AdvancedFilters from "@/components/catalog/AdvancedFilters";
import InfluencerCard from "@/components/catalog/InfluencerCard";
import { Search } from "lucide-react";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { CatalogSkeleton } from "@/components/common/CatalogSkeleton";
import { Button } from "@/components/ui/button";

const InfluencerCatalog = () => {
  const {
    filters,
    results,
    total,
    isLoading,
    error,
    updateFilters,
    updateSearchTerm,
    updateSort,
    resetFilters,
    getActiveFiltersCount,
  } = useAdvancedSearch({ page: 1, pageSize: 20 });

  // Transform results for InfluencerCard
  const transformedResults = results.map(result => ({
    id: result.id,
    name: `@${(result.first_name || 'user').toLowerCase()}`,
    fullName: `${result.first_name || ''} ${result.last_name || ''}`.trim() || 'Utilisateur',
    bio: result.bio || 'Créateur de contenu passionné',
    followers: result.totalFollowers,
    engagement: Number(result.avgEngagement.toFixed(1)),
    niche: result.categories[0] || "Lifestyle",
    categories: result.categories,
    minPrice: result.minPrice,
    avatar: result.avatar_url || "/placeholder.svg",
    location: result.city || "France",
    profileViews: result.profile_views || 0,
    isVerified: result.is_verified || false
  }));

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center text-red-600">
            Erreur lors du chargement des influenceurs. Veuillez réessayer.
          </div>
        </div>
      </div>;
  }

  if (isLoading && results.length === 0) {
    return <CatalogSkeleton />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gradient">
              Catalogue des Influenceurs
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Trouvez le partenaire idéal pour votre prochaine campagne
            </p>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          activeFiltersCount={getActiveFiltersCount()}
          onSearchChange={updateSearchTerm}
          onFiltersChange={updateFilters}
          onSortChange={updateSort}
          onReset={resetFilters}
          resultCount={total}
        />

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {transformedResults.map(influencer => <InfluencerCard key={influencer.id} influencer={influencer} />)}
        </div>

        {/* Empty State */}
        {transformedResults.length === 0 && !isLoading && <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              Aucun influenceur trouvé
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Essayez d'ajuster vos filtres de recherche
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>}

        {/* Loading State */}
        {isLoading && <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Recherche en cours...</p>
          </div>}
      </div>
    </div>;
};
export default InfluencerCatalog;