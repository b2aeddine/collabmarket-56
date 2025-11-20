import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const usePreloadData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Précharger les données courantes en arrière-plan avec requestIdleCallback
    const preloadQueries = [
      ['orders', user.id],
      ['offers', user.id],
      ['social-links', user.id],
      ['profile-categories', user.id],
      ['messages', user.id],
      ['notifications', user.id]
    ];

    const preloadData = () => {
      preloadQueries.forEach(([key, id]) => {
        queryClient.prefetchQuery({
          queryKey: [key, id],
          staleTime: 15 * 60 * 1000, // 15 minutes
        });
      });
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      const idleCallbackId = requestIdleCallback(preloadData, { timeout: 2000 });
      return () => cancelIdleCallback(idleCallbackId);
    } else {
      // Fallback to setTimeout
      const timeoutId = setTimeout(preloadData, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, queryClient]);
};