import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export const usePreloadData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Précharger les données courantes en arrière-plan
    const preloadQueries = [
      ['orders', user.id],
      ['offers', user.id],
      ['social-links', user.id],
      ['profile-categories', user.id],
      ['messages', user.id],
      ['notifications', user.id]
    ];

    preloadQueries.forEach(([key, id]) => {
      queryClient.prefetchQuery({
        queryKey: [key, id],
        staleTime: 15 * 60 * 1000, // 15 minutes
      });
    });
  }, [user?.id, queryClient]);
};