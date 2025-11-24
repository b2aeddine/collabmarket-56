import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
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

interface SocialLink {
  platform: string;
  followers: number;
  engagement_rate: number;
  username?: string;
}

interface Offer {
  price: number;
  is_active: boolean;
}

interface Review {
  rating: number;
}

interface Category {
  name: string;
  slug?: string;
}

interface ProfileCategory {
  categories: Category | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
  is_verified: boolean;
  profile_views?: number;
  created_at: string;
  social_links?: SocialLink[];
  offers?: Offer[];
  reviews?: Review[];
  profile_categories?: ProfileCategory[];
}

interface SearchResult extends Profile {
  totalFollowers: number;
  avgEngagement: number;
  minPrice: number;
  avgRating: number;
  categories: string[];
  platforms: string[];
  relevanceScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { filters }: { filters: SearchFilters } = await req.json();
    
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabaseClient
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        bio,
        city,
        avatar_url,
        is_verified,
        profile_views,
        created_at,
        profile_categories (
          categories (
            name,
            slug
          )
        ),
        social_links (
          platform,
          followers,
          engagement_rate,
          username
        ),
        offers (
          price,
          is_active
        ),
        reviews!reviews_influencer_id_fkey (
          rating
        )
      `)
      .eq('role', 'influenceur')
      .eq('is_profile_public', true)
      .eq('is_banned', false)
      .eq('is_verified', true);

    // Apply text search if provided
    if (filters.searchTerm && filters.searchTerm.trim()) {
      query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`);
    }

    // Apply city filter
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    // Get all results (we'll filter and sort them)
    const { data: profiles, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Transform and filter results
    let results = (profiles || []) as Profile[];
    results = results.map((profile) => {
      const totalFollowers = profile.social_links?.reduce((sum: number, link: SocialLink) => 
        sum + (link.followers || 0), 0) || 0;
      
      const avgEngagement = profile.social_links && profile.social_links.length > 0 
        ? profile.social_links.reduce((sum: number, link: SocialLink) => 
            sum + (link.engagement_rate || 0), 0) / profile.social_links.length 
        : 0;
      
      const activeOffers = profile.offers?.filter((o: Offer) => o.is_active) || [];
      const minPrice = activeOffers.length > 0
        ? Math.min(...activeOffers.map((o: Offer) => o.price))
        : 0;
      
      const avgRating = profile.reviews && profile.reviews.length > 0
        ? profile.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / profile.reviews.length
        : 0;
      
      const categories = profile.profile_categories?.map((pc: ProfileCategory) => 
        pc.categories?.name).filter((name): name is string => Boolean(name)) || [];
      
      const platforms = [...new Set(profile.social_links?.map((sl: SocialLink) => sl.platform) || [])];

      return {
        ...profile,
        totalFollowers,
        avgEngagement,
        minPrice,
        avgRating,
        categories,
        platforms,
        relevanceScore: 0 // Will be calculated below
      } as SearchResult;
    });

    // Apply additional filters
    if (filters.niche) {
      const niche = filters.niche;
      results = results.filter((r) => r.categories.includes(niche));
    }

    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      results = results.filter((r) => {
        if (r.minPrice === 0) return false;
        if (filters.minBudget !== undefined && r.minPrice < filters.minBudget) return false;
        if (filters.maxBudget !== undefined && r.minPrice > filters.maxBudget) return false;
        return true;
      });
    }

    if (filters.minFollowers !== undefined || filters.maxFollowers !== undefined) {
      results = results.filter((r) => {
        if (filters.minFollowers !== undefined && r.totalFollowers < filters.minFollowers) return false;
        if (filters.maxFollowers !== undefined && r.totalFollowers > filters.maxFollowers) return false;
        return true;
      });
    }

    if (filters.minEngagement !== undefined) {
      const minEngagement = filters.minEngagement;
      results = results.filter((r) => r.avgEngagement >= minEngagement);
    }

    if (filters.platforms && filters.platforms.length > 0) {
      const platforms = filters.platforms;
      results = results.filter((r) => 
        platforms.some(p => r.platforms.includes(p))
      );
    }

    // Calculate relevance score with AI if search term is provided
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (LOVABLE_API_KEY) {
        try {
          const prompt = `Given the search query "${filters.searchTerm}", score these influencer profiles from 0-100 based on relevance. Return ONLY a JSON array of scores in the same order.

Profiles:
${results.slice(0, 50).map((r: SearchResult, i: number) => 
  `${i}. ${r.first_name} ${r.last_name} - ${r.bio || 'No bio'} - Categories: ${r.categories.join(', ')}`
).join('\n')}

Return format: [score1, score2, ...]`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are a search relevance scorer. Return only JSON arrays of numbers.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const scores = JSON.parse(aiData.choices[0].message.content);
            
            results.slice(0, 50).forEach((r: SearchResult, i: number) => {
              r.relevanceScore = scores[i] || 50;
            });
          }
        } catch (aiError) {
          console.error('AI scoring error:', aiError);
          // Continue without AI scores
        }
      }
    }

    // Sort results
    const sortBy = filters.sortBy || 'relevance';
    results.sort((a: SearchResult, b: SearchResult) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'popularity':
          return b.totalFollowers - a.totalFollowers;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return b.avgRating - a.avgRating;
        case 'price_low':
          return (a.minPrice || Infinity) - (b.minPrice || Infinity);
        case 'price_high':
          return (b.minPrice || 0) - (a.minPrice || 0);
        case 'engagement':
          return b.avgEngagement - a.avgEngagement;
        default:
          return 0;
      }
    });

    // Paginate
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + pageSize);

    // Log search for analytics (if user is authenticated)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          await supabaseClient.from('search_history').insert({
            user_id: user.id,
            search_term: filters.searchTerm || '',
            filters: filters,
            result_count: total,
          });
        }
      } catch (logError) {
        console.error('Search logging error:', logError);
        // Continue without logging
      }
    }

    return new Response(
      JSON.stringify({
        results: paginatedResults,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total: 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});