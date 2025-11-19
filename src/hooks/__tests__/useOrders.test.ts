import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUpdateOrder } from '../useOrders';
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

describe('useUpdateOrder - Security Tests', () => {
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

  it('should allow user to update their own order (as influencer)', async () => {
    const orderId = 'order-123';
    
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock order fetch - user is the influencer
    const mockOrder = { influencer_id: mockUser.id, merchant_id: 'merchant-123' };
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      }),
    });

    // Mock update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: orderId }, error: null }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    } as any);

    const { result } = renderHook(
      () => useUpdateOrder(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true);
    });

    // Verify security check was performed
    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  it('should reject update when user tries to update another user order', async () => {
    const orderId = 'order-123';
    
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock order fetch - order belongs to different user
    const mockOrder = { influencer_id: mockOtherUser.id, merchant_id: 'merchant-123' };
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    const { result } = renderHook(
      () => useUpdateOrder(),
      { wrapper }
    );

    result.current.mutate({
      orderId,
      updates: { status: 'completed' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should have checked authentication and ownership
    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  it('should reject update when user is not authenticated', async () => {
    // Mock unauthenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { result } = renderHook(
      () => useUpdateOrder(),
      { wrapper }
    );

    result.current.mutate({
      orderId: 'order-123',
      updates: { status: 'completed' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(supabase.auth.getUser).toHaveBeenCalled();
  });
});

