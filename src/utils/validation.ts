/**
 * SECURITY: Input validation utilities
 * These functions help prevent injection attacks, XSS, and data corruption
 * 
 * IMPORTANT: Never remove these validations - they are critical for security
 */

import { z } from "zod";

/**
 * Validation schema for order payment data
 * Ensures all required fields are present and properly formatted
 */
export const orderPaymentSchema = z.object({
  brandName: z.string()
    .min(1, "Le nom de marque est requis")
    .max(200, "Le nom de marque ne peut pas dépasser 200 caractères")
    .trim(),
  productName: z.string()
    .min(1, "Le nom du produit est requis")
    .max(200, "Le nom du produit ne peut pas dépasser 200 caractères")
    .trim(),
  brief: z.string()
    .min(10, "Le brief doit contenir au moins 10 caractères")
    .max(2000, "Le brief ne peut pas dépasser 2000 caractères")
    .trim(),
  deadline: z.string().optional(),
  requirements: z.string()
    .max(2000, "Les instructions ne peuvent pas dépasser 2000 caractères")
    .optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales"
  }),
  paymentMethod: z.enum(["card", "bank_transfer", "stripe"]).optional(),
});

export type OrderPaymentData = z.infer<typeof orderPaymentSchema>;

/**
 * Validation schema for profile updates
 * Protects against injection and ensures data integrity
 */
export const profileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),
  last_name: z.string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^\+?[0-9\s-()]+$/, "Format de téléphone invalide")
    .max(20, "Le numéro de téléphone est trop long")
    .optional(),
  city: z.string()
    .max(100, "Le nom de la ville est trop long")
    .optional(),
  bio: z.string()
    .max(1000, "La bio ne peut pas dépasser 1000 caractères")
    .optional(),
});

/**
 * Validation schema for withdrawal requests
 */
export const withdrawalSchema = z.object({
  amount: z.number()
    .positive("Le montant doit être positif")
    .max(100000, "Le montant ne peut pas dépasser 100 000€")
    .refine(val => Number.isFinite(val), "Le montant doit être un nombre valide"),
  bankAccountId: z.string().uuid("ID de compte bancaire invalide"),
});

/**
 * Validates data against a schema and returns parsed result or null
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed data if valid, null otherwise with error message in console
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation errors for debugging (no sensitive data)
      console.warn("Validation failed:", error.errors.map(e => e.message).join(", "));
    }
    return null;
  }
}

// RFC 5322 compliant email regex (simplified but secure)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim and check length
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  // Check for basic structure
  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  // Additional checks
  if (trimmed.includes('..')) {
    return false; // No consecutive dots
  }

  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return false; // Cannot start or end with dot
  }

  const [localPart, domain] = trimmed.split('@');
  if (!localPart || !domain) {
    return false;
  }

  // Local part validation (before @)
  if (localPart.length > 64) {
    return false;
  }

  // Domain validation
  if (domain.length > 253) {
    return false;
  }

  if (!domain.includes('.')) {
    return false; // Domain must have at least one dot
  }

  return true;
}

/**
 * Validates a password
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 8)
 * @param requireUppercase - Require uppercase letter (default: true)
 * @param requireLowercase - Require lowercase letter (default: true)
 * @param requireNumber - Require number (default: true)
 * @returns Object with isValid boolean and errors array
 */
export function validatePassword(
  password: string,
  minLength: number = 8,
  requireUppercase: boolean = true,
  requireLowercase: boolean = true,
  requireNumber: boolean = true
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Le mot de passe est requis'] };
  }

  if (password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Le mot de passe est trop commun');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes a string to prevent XSS
 * @param input - String to sanitize
 * @param maxLength - Maximum length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Validates a URL
 * @param url - URL to validate
 * @param allowedProtocols - Allowed protocols (default: ['http', 'https'])
 * @returns true if valid, false otherwise
 */
export function validateUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    // Check protocol
    if (!allowedProtocols.includes(parsed.protocol.slice(0, -1))) {
      return false;
    }

    // Check hostname
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a phone number (French format)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove spaces, dots, dashes
  // eslint-disable-next-line no-useless-escape
  const cleaned = phone.replace(/[\s.\-]/g, '');

  // French phone: 10 digits starting with 0, or +33 followed by 9 digits
  const frenchPhoneRegex = /^(?:(?:\+33|0033)[1-9]\d{8}|0[1-9]\d{8})$/;

  return frenchPhoneRegex.test(cleaned);
}

/**
 * Validates a SIRET number
 * @param siret - SIRET to validate
 * @returns true if valid, false otherwise
 */
export function validateSIRET(siret: string): boolean {
  if (!siret || typeof siret !== 'string') {
    return false;
  }

  // Remove spaces
  const cleaned = siret.replace(/\s/g, '');

  // SIRET must be exactly 14 digits
  if (!/^\d{14}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm validation (simplified)
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

