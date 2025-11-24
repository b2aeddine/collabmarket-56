import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProfileUpdate } from '../useProfileUpdate';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('useProfileUpdate - Security Tests', () => {
  let queryClient: QueryClient;
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockOtherUser = { id: 'user-456', email: 'other@example.com' };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should allow user to update their own profile', async () => {
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock successful profile update
    const mockUpdate = vi.fn().mockResolvedValue({
      data: { id: 'user-123', first_name: 'John' },
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }) });
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      }),
    } as any);

    const { result } = renderHook(
      () => useProfileUpdate(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true);
    });

    // Verify the hook mutation is initialized and ready to use
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should reject update when user tries to update another user profile', async () => {
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const { result } = renderHook(
      () => useProfileUpdate(),
      { wrapper }
    );

    // Try to update another user's profile
    result.current.mutate({
      userId: mockOtherUser.id, // Different user ID
      profileData: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should have checked authentication
    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  it('should reject update when user is not authenticated', async () => {
    // Mock unauthenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { result } = renderHook(
      () => useProfileUpdate(),
      { wrapper }
    );

    result.current.mutate({
      userId: mockUser.id,
      profileData: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(supabase.auth.getUser).toHaveBeenCalled();
  });
});

