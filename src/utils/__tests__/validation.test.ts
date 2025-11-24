import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  sanitizeString,
  validateUrl,
  validatePhone,
  validateSIRET,
} from '../validation';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    expect(validateEmail('test123@test-domain.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('test..test@example.com')).toBe(false);
    expect(validateEmail('.test@example.com')).toBe(false);
  });

  it('should reject emails with excessive length', () => {
    const longEmail = 'a'.repeat(255) + '@example.com';
    expect(validateEmail(longEmail)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should accept strong passwords', () => {
    const result = validatePassword('StrongPass123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject weak passwords', () => {
    const result1 = validatePassword('weak');
    expect(result1.isValid).toBe(false);
    expect(result1.errors.length).toBeGreaterThan(0);

    const result2 = validatePassword('password123');
    expect(result2.isValid).toBe(false);
    expect(result2.errors).toContain('Le mot de passe est trop commun');
  });

  it('should enforce minimum length', () => {
    const result = validatePassword('Short1', 10);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 10 caractères');
  });

  it('should enforce uppercase requirement', () => {
    const result = validatePassword('alllowercase123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
  });

  it('should enforce number requirement', () => {
    const result = validatePassword('NoNumbers');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
  });
});

describe('sanitizeString', () => {
  it('should remove null bytes', () => {
    const input = 'test\0string';
    expect(sanitizeString(input)).toBe('teststring');
  });

  it('should remove control characters', () => {
    const input = 'test\x01\x02string';
    expect(sanitizeString(input)).toBe('teststring');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  test  ')).toBe('test');
  });

  it('should enforce max length', () => {
    const longString = 'a'.repeat(2000);
    const result = sanitizeString(longString, 100);
    expect(result.length).toBe(100);
  });

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString(null as unknown as string)).toBe('');
  });
});

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com/path?query=1')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('javascript:alert(1)')).toBe(false);
    expect(validateUrl('file:///etc/passwd')).toBe(false);
  });

  it('should respect allowed protocols', () => {
    expect(validateUrl('ftp://example.com', ['ftp'])).toBe(true);
    expect(validateUrl('ftp://example.com', ['http', 'https'])).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should accept valid French phone numbers', () => {
    expect(validatePhone('0612345678')).toBe(true);
    expect(validatePhone('06 12 34 56 78')).toBe(true);
    expect(validatePhone('06-12-34-56-78')).toBe(true);
    expect(validatePhone('+33612345678')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('00012345678')).toBe(false);
    expect(validatePhone('invalid')).toBe(false);
  });
});

describe('validateSIRET', () => {
  it('should accept valid SIRET numbers', () => {
    // Example valid SIRET (using Luhn algorithm)
    expect(validateSIRET('73282932000074')).toBe(true);
  });

  it('should reject invalid SIRET numbers', () => {
    expect(validateSIRET('12345678901234')).toBe(false); // Invalid checksum
    expect(validateSIRET('123')).toBe(false); // Too short
    expect(validateSIRET('abcdefghijklmn')).toBe(false); // Not numeric
  });

  it('should accept SIRET with spaces', () => {
    expect(validateSIRET('732 829 320 00074')).toBe(true);
  });
});

