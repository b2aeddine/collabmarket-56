import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import InfluencerCard from "@/components/catalog/InfluencerCard";
import { Search, RefreshCw } from "lucide-react";
import { useInfluencers } from "@/hooks/useProfiles";
import { useDebounce } from "@/hooks/useDebounce";
import { CatalogSkeleton } from "@/components/common/CatalogSkeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
const InfluencerCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedFollowers, setSelectedFollowers] = useState("all");

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();
  const {
    influencers,
    isLoading,
    error
  } = useInfluencers();

  // Function to refresh data
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['influencers']
    });
  }, [queryClient]);

  // Memoize the transformation to avoid recalculation on every render
  const transformedInfluencers = useMemo(() => {
    if (!influencers) return [];
    return influencers.map(influencer => {
      const totalFollowers = influencer.social_links?.reduce((sum, link) => sum + (link.followers || 0), 0) || 0;
      const avgEngagement = influencer.social_links?.length > 0 ? influencer.social_links.reduce((sum, link) => sum + (link.engagement_rate || 0), 0) / influencer.social_links.length : 0;
      const minPrice = influencer.offers?.length > 0 ? Math.min(...influencer.offers.map(offer => offer.price)) : 100;
      const categories = influencer.profile_categories?.map(pc => pc.categories?.name).filter((name): name is string => Boolean(name)) || [];
      const primaryCategory = categories[0] || "Lifestyle";
      return {
        id: influencer.id,
        name: `@${(influencer.first_name || 'user').toLowerCase()}`,
        fullName: `${influencer.first_name || ''} ${influencer.last_name || ''}`.trim() || 'Utilisateur',
        bio: influencer.bio || 'Créateur de contenu passionné',
        followers: totalFollowers,
        engagement: Number(avgEngagement.toFixed(1)),
        niche: primaryCategory,
        categories: categories,
        minPrice: minPrice,
        avatar: influencer.avatar_url || "/placeholder.svg",
        location: influencer.city || "France",
        profileViews: influencer.profile_views || 0
      };
    });
  }, [influencers]);

  // Memoize filtered results to avoid recalculation on irrelevant state changes
  const filteredInfluencers = useMemo(() => {
    return transformedInfluencers.filter(influencer => {
      const matchesSearch = influencer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || influencer.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || influencer.niche.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesNiche = selectedNiche === "all" || influencer.niche === selectedNiche;
      const matchesBudget = selectedBudget === "all" || selectedBudget === "0-100" && influencer.minPrice <= 100 || selectedBudget === "100-200" && influencer.minPrice > 100 && influencer.minPrice <= 200 || selectedBudget === "200+" && influencer.minPrice > 200;
      const matchesFollowers = selectedFollowers === "all" || selectedFollowers === "0-30k" && influencer.followers <= 30000 || selectedFollowers === "30k-50k" && influencer.followers > 30000 && influencer.followers <= 50000 || selectedFollowers === "50k+" && influencer.followers > 50000;
      return matchesSearch && matchesNiche && matchesBudget && matchesFollowers;
    });
  }, [transformedInfluencers, debouncedSearchTerm, selectedNiche, selectedBudget, selectedFollowers]);

  // Memoized callbacks to prevent child re-renders
  const handleSearchChange = useCallback((value: string) => setSearchTerm(value), []);
  const handleNicheChange = useCallback((value: string) => setSelectedNiche(value), []);
  const handleBudgetChange = useCallback((value: string) => setSelectedBudget(value), []);
  const handleFollowersChange = useCallback((value: string) => setSelectedFollowers(value), []);
  if (error) {
    console.error('Error loading influencers:', error);
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center text-red-600">
            Erreur lors du chargement des influenceurs. Veuillez réessayer.
          </div>
        </div>
      </div>;
  }
  if (isLoading) {
    return <CatalogSkeleton />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              Catalogue des Influenceurs
            </h1>
            <p className="text-xl text-gray-600">
              Trouvez le partenaire idéal pour votre prochaine campagne
            </p>
          </div>
          
        </div>

        {/* Filters */}
        <CatalogFilters searchTerm={searchTerm} selectedNiche={selectedNiche} selectedBudget={selectedBudget} selectedFollowers={selectedFollowers} onSearchChange={handleSearchChange} onNicheChange={handleNicheChange} onBudgetChange={handleBudgetChange} onFollowersChange={handleFollowersChange} />

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredInfluencers.length} influenceur{filteredInfluencers.length > 1 ? 's' : ''} trouvé{filteredInfluencers.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer, index) => (
            <div
              key={influencer.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              <InfluencerCard influencer={influencer} />
            </div>
          ))}
        </div>

        {filteredInfluencers.length === 0 && !isLoading && <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun influenceur trouvé
            </h3>
            <p className="text-gray-500">
              {transformedInfluencers.length === 0 ? "Aucun influenceur n'est encore enregistré dans la base de données." : "Essayez d'ajuster vos filtres de recherche"}
            </p>
          </div>}
      </div>
    </div>;
};
export default InfluencerCatalog;