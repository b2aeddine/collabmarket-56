import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';

export interface SearchFilters {
  searchTerm?: string;
  niche?: string;
  minBudget?: number;
  maxBudget?: number;
  minFollowers?: number;
  maxFollowers?: number;
  city?: string;
  minEngagement?: number;
  platforms?: string[];
  isVerified?: boolean;
  sortBy?: 'relevance' | 'popularity' | 'recent' | 'rating' | 'price_low' | 'price_high' | 'engagement';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  avatar_url: string;
  is_verified: boolean;
  profile_views: number;
  created_at: string;
  totalFollowers: number;
  avgEngagement: number;
  minPrice: number;
  avgRating: number;
  categories: string[];
  platforms: string[];
  relevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useAdvancedSearch = (initialFilters: SearchFilters = {}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 400);
  const debouncedCity = useDebounce(filters.city || '', 400);

  const search = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-influencers', {
        body: { filters: searchFilters }
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      toast.error(errorMessage);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const searchFilters = {
      ...filters,
      searchTerm: debouncedSearchTerm,
      city: debouncedCity,
    };
    search(searchFilters);
  }, [debouncedSearchTerm, debouncedCity, filters.niche, filters.minBudget, filters.maxBudget, 
      filters.minFollowers, filters.maxFollowers, filters.minEngagement,
      filters.platforms, filters.isVerified, filters.sortBy, filters.page, search]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
  }, []);

  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  }, []);

  const updateSort = useCallback((sortBy: SearchFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const nextPage = useCallback(() => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, pageSize: 20 });
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.niche) count++;
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) count++;
    if (filters.minFollowers !== undefined || filters.maxFollowers !== undefined) count++;
    if (filters.city) count++;
    if (filters.minEngagement !== undefined) count++;
    if (filters.platforms && filters.platforms.length > 0) count++;
    if (filters.isVerified !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters,
    results,
    total,
    isLoading,
    error,
    updateFilters,
    updateSearchTerm,
    updateSort,
    nextPage,
    prevPage,
    resetFilters,
    getActiveFiltersCount,
    search,
  };
};