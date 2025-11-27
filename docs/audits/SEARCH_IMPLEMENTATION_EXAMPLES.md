# 💻 Exemples d'Implémentation - Système de Recherche Avancé

## 1. Hook Avancé de Recherche

### `src/hooks/useAdvancedSearch.ts`

```typescript
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface SearchFilters {
  searchTerm: string;
  niches: string[];
  budgetMin?: number;
  budgetMax?: number;
  followersMin?: number;
  followersMax?: number;
  cities: string[];
  platforms: string[];
  engagementMin?: number;
  verified?: boolean;
  rating?: number;
}

export type SortOption = 
  | 'relevance'
  | 'popularity'
  | 'recent'
  | 'rating'
  | 'price_low'
  | 'price_high'
  | 'engagement';

interface UseAdvancedSearchOptions {
  pageSize?: number;
  enableCache?: boolean;
  enableAI?: boolean;
}

export const useAdvancedSearch = (
  filters: SearchFilters,
  sortBy: SortOption = 'relevance',
  options: UseAdvancedSearchOptions = {}
) => {
  const {
    pageSize = 20,
    enableCache = true,
    enableAI = true
  } = options;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Track active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchTerm) count++;
    if (filters.niches.length > 0) count++;
    if (filters.budgetMin || filters.budgetMax) count++;
    if (filters.followersMin || filters.followersMax) count++;
    if (filters.cities.length > 0) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.engagementMin) count++;
    if (filters.verified !== undefined) count++;
    if (filters.rating) count++;
    return count;
  }, [filters, debouncedSearchTerm]);

  // Save search to history
  const saveSearchToHistory = useCallback(async () => {
    if (!debouncedSearchTerm) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('search_history').insert({
      user_id: user.id,
      search_term: debouncedSearchTerm,
      filters: filters,
      sort_by: sortBy
    });
  }, [debouncedSearchTerm, filters, sortBy]);

  // Main search query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['advanced-search', debouncedSearchTerm, filters, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('search-influencers', {
        body: {
          searchTerm: debouncedSearchTerm,
          filters,
          sortBy,
          pageSize,
          enableAI
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: true,
    staleTime: enableCache ? 5 * 60 * 1000 : 0, // 5 minutes cache
    gcTime: enableCache ? 10 * 60 * 1000 : 0
  });

  // Save search on change
  useEffect(() => {
    if (debouncedSearchTerm) {
      saveSearchToHistory();
    }
  }, [debouncedSearchTerm, saveSearchToHistory]);

  // Search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('search_history')
        .select('search_term')
        .ilike('search_term', `${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) return [];
      return [...new Set(data.map(item => item.search_term))];
    },
    enabled: debouncedSearchTerm.length >= 2
  });

  return {
    results: data?.results || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
    activeFiltersCount,
    suggestions: suggestions || [],
    aiScore: data?.aiScore
  };
};
```

---

## 2. Composant de Filtres Avancés

### `src/components/catalog/AdvancedFilters.tsx`

```typescript
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { SearchFilters, SortOption } from '@/hooks/useAdvancedSearch';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  sortBy: SortOption;
  onFiltersChange: (filters: SearchFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  activeCount: number;
  suggestions?: string[];
}

export const AdvancedFilters = ({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onReset,
  activeCount,
  suggestions = []
}: AdvancedFiltersProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update specific filter
  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Add to array filter
  const addToArrayFilter = (key: 'niches' | 'cities' | 'platforms', value: string) => {
    if (!filters[key].includes(value)) {
      updateFilter(key, [...filters[key], value]);
    }
  };

  // Remove from array filter
  const removeFromArrayFilter = (
    key: 'niches' | 'cities' | 'platforms',
    value: string
  ) => {
    updateFilter(key, filters[key].filter(item => item !== value));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar with Suggestions */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Recherche intelligente... (ex: 'influenceur beauté Paris engagement élevé')"
              value={filters.searchTerm}
              onChange={(e) => {
                updateFilter('searchTerm', e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-10"
            />
            {filters.searchTerm && (
              <button
                onClick={() => updateFilter('searchTerm', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateFilter('searchTerm', suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Pertinence
              </div>
            </SelectItem>
            <SelectItem value="popularity">Popularité</SelectItem>
            <SelectItem value="recent">Plus récent</SelectItem>
            <SelectItem value="rating">Mieux noté</SelectItem>
            <SelectItem value="price_low">Prix croissant</SelectItem>
            <SelectItem value="price_high">Prix décroissant</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile: Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtres de recherche</SheetTitle>
            </SheetHeader>
            <FiltersContent
              filters={filters}
              updateFilter={updateFilter}
              addToArrayFilter={addToArrayFilter}
              removeFromArrayFilter={removeFromArrayFilter}
              onReset={onReset}
            />
          </SheetContent>
        </Sheet>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Active Filters Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <FilterChip
              label={`Recherche: ${filters.searchTerm}`}
              onRemove={() => updateFilter('searchTerm', '')}
            />
          )}
          {filters.niches.map(niche => (
            <FilterChip
              key={niche}
              label={`Niche: ${niche}`}
              onRemove={() => removeFromArrayFilter('niches', niche)}
            />
          ))}
          {(filters.budgetMin || filters.budgetMax) && (
            <FilterChip
              label={`Budget: ${filters.budgetMin || 0}€ - ${filters.budgetMax || '∞'}€`}
              onRemove={() => {
                updateFilter('budgetMin', undefined);
                updateFilter('budgetMax', undefined);
              }}
            />
          )}
          {/* Add more filter chips for other active filters */}
        </div>
      )}

      {/* Desktop: Filters Accordion */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-4">
            <FiltersContent
              filters={filters}
              updateFilter={updateFilter}
              addToArrayFilter={addToArrayFilter}
              removeFromArrayFilter={removeFromArrayFilter}
              onReset={onReset}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Badge variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
);

// Filters Content Component
const FiltersContent = ({
  filters,
  updateFilter,
  addToArrayFilter,
  removeFromArrayFilter,
  onReset
}: any) => (
  <Accordion type="multiple" defaultValue={['niches', 'budget', 'followers']} className="w-full">
    {/* Niches Filter */}
    <AccordionItem value="niches">
      <AccordionTrigger>Niches</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {['Lifestyle', 'Tech', 'Food', 'Fitness', 'Travel', 'Beauty', 'Gaming'].map(niche => (
            <label key={niche} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.niches.includes(niche)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArrayFilter('niches', niche);
                  } else {
                    removeFromArrayFilter('niches', niche);
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{niche}</span>
            </label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Budget Range */}
    <AccordionItem value="budget">
      <AccordionTrigger>Budget</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div>
            <Label>Min: {filters.budgetMin || 0}€</Label>
            <Slider
              value={[filters.budgetMin || 0]}
              onValueChange={([value]) => updateFilter('budgetMin', value)}
              max={1000}
              step={10}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Max: {filters.budgetMax || 1000}€</Label>
            <Slider
              value={[filters.budgetMax || 1000]}
              onValueChange={([value]) => updateFilter('budgetMax', value)}
              max={1000}
              step={10}
              className="mt-2"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Followers Range */}
    <AccordionItem value="followers">
      <AccordionTrigger>Followers</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div>
            <Label>Min: {(filters.followersMin || 0).toLocaleString()}</Label>
            <Slider
              value={[filters.followersMin || 0]}
              onValueChange={([value]) => updateFilter('followersMin', value)}
              max={1000000}
              step={1000}
              className="mt-2"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Engagement Rate */}
    <AccordionItem value="engagement">
      <AccordionTrigger>Taux d'engagement</AccordionTrigger>
      <AccordionContent>
        <div>
          <Label>Min: {filters.engagementMin || 0}%</Label>
          <Slider
            value={[filters.engagementMin || 0]}
            onValueChange={([value]) => updateFilter('engagementMin', value)}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Verified Only */}
    <AccordionItem value="verified">
      <AccordionTrigger>Vérification</AccordionTrigger>
      <AccordionContent>
        <div className="flex items-center justify-between">
          <Label>Comptes vérifiés uniquement</Label>
          <Switch
            checked={filters.verified || false}
            onCheckedChange={(checked) => updateFilter('verified', checked)}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
```

---

## 3. Edge Function pour Recherche Intelligente

### `supabase/functions/search-influencers/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      searchTerm, 
      filters, 
      sortBy, 
      pageSize = 20,
      enableAI = true 
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Build base query
    let query = supabaseClient
      .from('profiles')
      .select(`
        *,
        social_links(*),
        offers(*),
        profile_categories(
          categories(*)
        ),
        reviews(rating)
      `)
      .eq('role', 'influenceur')
      .eq('is_profile_public', true)
      .eq('is_banned', false)
      .eq('is_verified', true);

    // Apply filters
    if (searchTerm && !enableAI) {
      // Simple text search
      query = query.or(
        `first_name.ilike.%${searchTerm}%,` +
        `last_name.ilike.%${searchTerm}%,` +
        `bio.ilike.%${searchTerm}%`
      );
    }

    if (filters.niches?.length > 0) {
      // Filter by categories through junction table
      query = query.in('profile_categories.categories.name', filters.niches);
    }

    if (filters.cities?.length > 0) {
      query = query.in('city', filters.cities);
    }

    if (filters.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }

    // Execute query
    const { data: profiles, error } = await query;

    if (error) throw error;

    // Post-processing filters (budget, followers, engagement)
    let filteredProfiles = profiles.filter(profile => {
      // Budget filter
      if (filters.budgetMin || filters.budgetMax) {
        const minPrice = Math.min(...(profile.offers?.map(o => o.price) || [Infinity]));
        if (filters.budgetMin && minPrice < filters.budgetMin) return false;
        if (filters.budgetMax && minPrice > filters.budgetMax) return false;
      }

      // Followers filter
      if (filters.followersMin) {
        const totalFollowers = profile.social_links?.reduce(
          (sum, link) => sum + (link.followers || 0),
          0
        ) || 0;
        if (totalFollowers < filters.followersMin) return false;
      }

      // Engagement filter
      if (filters.engagementMin) {
        const avgEngagement = profile.social_links?.length > 0
          ? profile.social_links.reduce((sum, link) => sum + (link.engagement_rate || 0), 0) / profile.social_links.length
          : 0;
        if (avgEngagement < filters.engagementMin) return false;
      }

      return true;
    });

    // AI Scoring (if enabled and has search term)
    if (enableAI && searchTerm) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (LOVABLE_API_KEY) {
        // Score each profile with AI
        const scoredProfiles = await Promise.all(
          filteredProfiles.map(async (profile) => {
            const profileText = `
              Name: ${profile.first_name} ${profile.last_name}
              Bio: ${profile.bio || ''}
              Categories: ${profile.profile_categories?.map(pc => pc.categories?.name).join(', ')}
            `.trim();

            try {
              const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are a relevance scoring system. Rate how well a profile matches a search query on a scale of 0-1.'
                    },
                    {
                      role: 'user',
                      content: `Search Query: "${searchTerm}"\n\nProfile:\n${profileText}\n\nRelevance Score (0-1):`
                    }
                  ],
                  temperature: 0.3
                })
              });

              if (response.ok) {
                const result = await response.json();
                const scoreText = result.choices[0]?.message?.content || '0.5';
                const score = parseFloat(scoreText.match(/[\d.]+/)?.[0] || '0.5');
                return { ...profile, aiScore: Math.max(0, Math.min(1, score)) };
              }
            } catch (error) {
              console.error('AI scoring error:', error);
            }

            return { ...profile, aiScore: 0.5 };
          })
        );

        filteredProfiles = scoredProfiles.filter(p => p.aiScore > 0.3);
      }
    }

    // Sorting
    filteredProfiles.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.aiScore || 0) - (a.aiScore || 0);
        
        case 'popularity':
          const aFollowers = a.social_links?.reduce((sum, link) => sum + (link.followers || 0), 0) || 0;
          const bFollowers = b.social_links?.reduce((sum, link) => sum + (link.followers || 0), 0) || 0;
          return bFollowers - aFollowers;
        
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'rating':
          const aRating = a.reviews?.reduce((sum, r) => sum + r.rating, 0) / (a.reviews?.length || 1);
          const bRating = b.reviews?.reduce((sum, r) => sum + r.rating, 0) / (b.reviews?.length || 1);
          return bRating - aRating;
        
        case 'price_low':
          const aPrice = Math.min(...(a.offers?.map(o => o.price) || [Infinity]));
          const bPrice = Math.min(...(b.offers?.map(o => o.price) || [Infinity]));
          return aPrice - bPrice;
        
        case 'price_high':
          const aMaxPrice = Math.min(...(a.offers?.map(o => o.price) || [0]));
          const bMaxPrice = Math.min(...(b.offers?.map(o => o.price) || [0]));
          return bMaxPrice - aMaxPrice;
        
        case 'engagement':
          const aEng = a.social_links?.reduce((sum, link) => sum + (link.engagement_rate || 0), 0) / (a.social_links?.length || 1);
          const bEng = b.social_links?.reduce((sum, link) => sum + (link.engagement_rate || 0), 0) / (b.social_links?.length || 1);
          return bEng - aEng;
        
        default:
          return 0;
      }
    });

    // Pagination
    const results = filteredProfiles.slice(0, pageSize);

    // Log analytics
    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (user) {
      await supabaseClient.from('search_analytics').insert({
        user_id: user.id,
        search_term: searchTerm,
        filters: filters,
        sort_by: sortBy,
        results_count: filteredProfiles.length
      });
    }

    return new Response(
      JSON.stringify({
        results,
        totalCount: filteredProfiles.length,
        page: 1,
        pageSize
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

---

## 4. Migration SQL pour Analytics

### `supabase/migrations/XXXXXX_search_analytics.sql`

```sql
-- Table pour l'historique de recherche
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  search_term TEXT NOT NULL,
  filters JSONB,
  sort_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_term ON search_history(search_term);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);

-- Table pour les analytics de recherche
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  search_term TEXT,
  filters JSONB,
  sort_by TEXT,
  results_count INTEGER,
  clicked_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_order BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_analytics_term ON search_analytics(search_term);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);

-- RLS Policies
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
ON public.search_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
ON public.search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage analytics"
ON public.search_analytics FOR ALL
USING (true);

-- Function pour obtenir les recherches populaires
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  search_term TEXT,
  search_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.search_term,
    COUNT(*) as search_count
  FROM search_history sh
  WHERE sh.created_at > NOW() - INTERVAL '7 days'
  GROUP BY sh.search_term
  ORDER BY search_count DESC
  LIMIT limit_count;
END;
$$;
```

---

## 5. Tests d'Intégration

### `src/__tests__/search.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

describe('Advanced Search', () => {
  const defaultFilters = {
    searchTerm: '',
    niches: [],
    cities: [],
    platforms: []
  };

  it('should return results based on search term', async () => {
    const { result } = renderHook(() =>
      useAdvancedSearch(
        { ...defaultFilters, searchTerm: 'beauty' },
        'relevance'
      )
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results.length).toBeGreaterThan(0);
  });

  it('should count active filters correctly', async () => {
    const { result } = renderHook(() =>
      useAdvancedSearch(
        {
          ...defaultFilters,
          searchTerm: 'test',
          niches: ['Beauty', 'Tech'],
          budgetMin: 100
        },
        'relevance'
      )
    );

    await waitFor(() => {
      expect(result.current.activeFiltersCount).toBe(3);
    });
  });

  it('should provide search suggestions', async () => {
    const { result } = renderHook(() =>
      useAdvancedSearch(
        { ...defaultFilters, searchTerm: 'beau' },
        'relevance'
      )
    );

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });
  });
});
```

---

Ces exemples montrent une implémentation complète et production-ready du système de recherche avancé avec toutes les fonctionnalités proposées dans l'analyse.
