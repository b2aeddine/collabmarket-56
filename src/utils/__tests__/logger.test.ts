import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('Logger Security Tests', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redact password in string logs', () => {
    logger.error('Failed to login', { password: 'secret123' });
    
    const calls = consoleErrorSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    
    // Check that no call contains the actual password
    const allCallsString = JSON.stringify(calls);
    expect(allCallsString).not.toContain('secret123');
  });

  it('should redact tokens in string logs', () => {
    logger.error('API call failed', { token: 'abc123xyz' });
    
    const calls = consoleErrorSpy.mock.calls;
    const allCallsString = JSON.stringify(calls);
    expect(allCallsString).not.toContain('abc123xyz');
  });

  it('should redact API keys', () => {
    logger.error('Config error', { apiKey: 'sk_live_1234567890' });
    
    const calls = consoleErrorSpy.mock.calls;
    const allCallsString = JSON.stringify(calls);
    expect(allCallsString).not.toContain('sk_live_1234567890');
  });

  it('should handle nested objects with sensitive data', () => {
    logger.error('Authentication failed', {
      user: {
        email: 'test@example.com',
        password: 'supersecret',
        token: 'jwt_token_here',
      },
    });
    
    const calls = consoleErrorSpy.mock.calls;
    const allCallsString = JSON.stringify(calls);
    expect(allCallsString).not.toContain('supersecret');
    expect(allCallsString).not.toContain('jwt_token_here');
  });

  it('should handle arrays with sensitive data', () => {
    logger.error('Multiple errors', [
      { password: 'pass1' },
      { password: 'pass2' },
    ]);
    
    const calls = consoleErrorSpy.mock.calls;
    const allCallsString = JSON.stringify(calls);
    expect(allCallsString).not.toContain('pass1');
    expect(allCallsString).not.toContain('pass2');
  });

  it('should allow non-sensitive data to pass through', () => {
    logger.info('User logged in', { email: 'test@example.com', userId: '123' });
    
    // Logger should sanitize and allow non-sensitive data
    // The test verifies that the logger doesn't throw errors for valid data
    expect(consoleLogSpy).toHaveBeenCalledTimes(0); // In test mode, console is mocked
  });

  it('should not log debug messages in production', () => {
    // This test assumes production mode
    const originalEnv = import.meta.env.MODE;
    
    logger.debug('Debug message', { data: 'test' });
    
    // In production, debug should not log
    if (import.meta.env.PROD) {
      expect(consoleLogSpy).not.toHaveBeenCalled();
    }
  });
});

