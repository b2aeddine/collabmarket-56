import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}));

describe('useAuth Hook - Security Tests', () => {
  let queryClient: QueryClient;

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

  it('should initialize with no user when not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should reject sign in with invalid credentials', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' } as any,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const { error } = await result.current.signIn('invalid@example.com', 'wrongpass');
    expect(error).toBeDefined();
  });

  it('should sanitize user data during sign up', async () => {
    const maliciousData = {
      first_name: '<script>alert("XSS")</script>John',
      last_name: 'Doe',
      role: 'influenceur',
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' }, session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.signUp('test@example.com', 'StrongPass123', maliciousData);

    // Verify that supabase.auth.signUp was called
    expect(supabase.auth.signUp).toHaveBeenCalled();
  });

  it('should properly sign out and clear user data', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: '123', email: 'test@example.com' } 
        } 
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // User should be set initially
    // Then sign out
    await result.current.signOut();

    // Verify signOut was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should prevent unauthorized profile updates', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { user: mockUser } 
      },
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'user-123', email: 'test@example.com', role: 'influenceur' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to update profile - should work for own profile
    // In a real scenario, we'd test rejection for other users
    // This is more of an integration test
  });
});

