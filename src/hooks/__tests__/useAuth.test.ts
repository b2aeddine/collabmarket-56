import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Supabase Intelligent
vi.mock('@/integrations/supabase/client', () => {
  let currentSession: any = null;
  const authListeners: Array<(event: string, session: any) => void> = [];

  const notifyListeners = (event: string, session: any) => {
    authListeners.forEach(listener => listener(event, session));
  };

  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '123', role: 'influenceur' }, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      auth: {
        getSession: vi.fn().mockImplementation(() => Promise.resolve({ data: { session: currentSession }, error: null })),
        onAuthStateChange: vi.fn().mockImplementation((callback) => {
          authListeners.push(callback);
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  const index = authListeners.indexOf(callback);
                  if (index > -1) authListeners.splice(index, 1);
                }
              }
            }
          };
        }),

        signInWithPassword: vi.fn().mockImplementation(({ email, password }) => {
          if (email === 'test@example.com' && password === 'password123') {
            currentSession = { user: { id: '123', email } };
            notifyListeners('SIGNED_IN', currentSession);
            return Promise.resolve({ data: { session: currentSession }, error: null });
          }
          return Promise.resolve({ data: { session: null }, error: { message: 'Invalid login credentials' } });
        }),

        signUp: vi.fn().mockImplementation(({ email }) => {
          if (email === 'existing@example.com') {
            return Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate key email' } });
          }
          return Promise.resolve({ data: { user: { id: 'new', email } }, error: null });
        }),

        signOut: vi.fn().mockImplementation(() => {
          currentSession = null;
          notifyListeners('SIGNED_OUT', null);
          return Promise.resolve({ error: null });
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
      }),
    },
  };
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user).toBeNull());
  });

  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.signIn('test@example.com', 'password123');
    await waitFor(() => expect(result.current.user).toBeTruthy());
  });

  it('should handle failed login', async () => {
    const { result } = renderHook(() => useAuth());
    const res = await result.current.signIn('wrong@test.com', 'badpass');
    expect(res.error).toBeTruthy();
  });
});
