/**
 * Centralized error handling utility
 * Maps technical errors to user-friendly messages
 * SECURITY: Prevents information disclosure by hiding technical details
 */

interface ErrorResponse {
  message: string;
  code?: string;
}

/**
 * Maps error codes to user-friendly French messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'invalid_grant': 'Identifiants invalides',
  'email_not_confirmed': 'Veuillez confirmer votre email',
  'user_not_found': 'Utilisateur non trouvé',
  'invalid_credentials': 'Email ou mot de passe incorrect',
  
  // Payment errors
  'insufficient_funds': 'Fonds insuffisants',
  'payment_failed': 'Le paiement a échoué',
  'payment_intent_authentication_failure': 'Authentification du paiement échouée',
  'card_declined': 'Carte refusée',
  'stripe_error': 'Erreur lors du traitement du paiement',
  
  // Database errors
  'PGRST116': 'Aucune donnée trouvée',
  '23505': 'Cette donnée existe déjà',
  '23503': 'Données liées manquantes',
  '42501': 'Accès non autorisé',
  
  // Network errors
  'network_error': 'Erreur de connexion. Vérifiez votre connexion internet',
  'timeout': 'La requête a expiré. Veuillez réessayer',
  
  // Validation errors
  'validation_error': 'Données invalides',
  'invalid_input': 'Les données saisies sont invalides',
};

/**
 * Determines if an error code indicates a security issue
 */
const SECURITY_ERROR_CODES = ['42501', 'insufficient_permissions', 'unauthorized'];

/**
 * Sanitizes error messages to prevent information disclosure
 * @param error - Error object from any source
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'Une erreur inattendue s\'est produite';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for known error patterns
    for (const [code, userMessage] of Object.entries(ERROR_MESSAGES)) {
      if (message.includes(code.toLowerCase())) {
        return userMessage;
      }
    }
    
    // Security errors - use generic message
    if (SECURITY_ERROR_CODES.some(code => message.includes(code))) {
      return 'Accès non autorisé';
    }
    
    // Stripe errors
    if (message.includes('stripe')) {
      return ERROR_MESSAGES.stripe_error;
    }
    
    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return ERROR_MESSAGES.network_error;
    }
    
    // Timeout errors
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.timeout;
    }
  }

  // Handle Supabase error format
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    if (errorObj.code && typeof errorObj.code === 'string') {
      const knownError = ERROR_MESSAGES[errorObj.code];
      if (knownError) return knownError;
    }
    
    if (errorObj.message && typeof errorObj.message === 'string') {
      // Check if message contains known patterns
      const lowerMessage = errorObj.message.toLowerCase();
      for (const [code, userMessage] of Object.entries(ERROR_MESSAGES)) {
        if (lowerMessage.includes(code.toLowerCase())) {
          return userMessage;
        }
      }
    }
  }

  // Default fallback - never expose technical details
  return 'Une erreur s\'est produite. Veuillez réessayer';
}

/**
 * Logs error details for debugging without exposing to users
 * @param context - Where the error occurred
 * @param error - Error object
 */
export function logError(context: string, error: unknown): void {
  // Only log in development
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
}

/**
 * Complete error handling: logs error and returns user-friendly message
 */
export function handleError(context: string, error: unknown): string {
  logError(context, error);
  return getErrorMessage(error);
}
