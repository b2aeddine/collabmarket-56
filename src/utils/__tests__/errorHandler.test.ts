import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorHandler';

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('should return generic message for unknown errors', () => {
      const error = new Error('Some random technical error');
      expect(getErrorMessage(error)).toBe("Une erreur s'est produite. Veuillez réessayer");
    });

    it('should handle email already exists error', () => {
      const error = { code: '23505', message: 'duplicate key value violates unique constraint "profiles_email_key"' };
      expect(getErrorMessage(error)).toBe("Cette adresse email est déjà utilisée");
    });

    it('should handle weak password error', () => {
      const error = { message: 'Password should be at least 6 characters' };
      expect(getErrorMessage(error)).toContain("Le mot de passe doit contenir au moins");
    });

    it('should handle authentication errors', () => {
      const error = { message: 'Invalid login credentials' };
      expect(getErrorMessage(error)).toBe("Email ou mot de passe incorrect");
    });

    it('should handle network errors', () => {
      const error = { message: 'Failed to fetch' };
      expect(getErrorMessage(error)).toBe("Erreur de connexion. Vérifiez votre connexion internet");
    });

    it('should handle objects without message property', () => {
      const error = { foo: 'bar' };
      expect(getErrorMessage(error)).toBe("Une erreur s'est produite. Veuillez réessayer");
    });
  });
});
