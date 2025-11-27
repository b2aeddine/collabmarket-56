import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorHandler';

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('should return default message for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('Une erreur inattendue s\'est produite');
      expect(getErrorMessage(undefined)).toBe('Une erreur inattendue s\'est produite');
    });

    it('should handle standard Error objects', () => {
      const error = new Error('Some random error');
      // Should fallback to generic if not matched
      expect(getErrorMessage(error)).toBe('Une erreur inattendue s\'est produite');
    });

    it('should map known error codes from message', () => {
      expect(getErrorMessage(new Error('Error: invalid_grant'))).toBe('Identifiants invalides');
      expect(getErrorMessage(new Error('Some network error occurred'))).toBe('Erreur de connexion. Vérifiez votre connexion internet');
    });

    it('should map Stripe errors', () => {
      expect(getErrorMessage(new Error('Stripe authentication failed'))).toBe('Erreur lors du traitement du paiement');
    });

    it('should handle Supabase-like error objects', () => {
      const supabaseError = { code: '23505', message: 'Duplicate key' };
      expect(getErrorMessage(supabaseError)).toBe('Cette donnée existe déjà');
    });

    it('should handle security errors by masking them', () => {
      expect(getErrorMessage(new Error('Permission denied 42501'))).toBe('Accès non autorisé');
    });

    it('should return message property if present and no code matched', () => {
      const customError = { message: 'Custom user message' };
      expect(getErrorMessage(customError)).toBe('Custom user message');
    });
  });
});
