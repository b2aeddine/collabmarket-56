// Secure error handling utility for edge functions
// Prevents information leakage by mapping errors to generic user messages

import { z } from "https://esm.sh/zod@3.22.4";

export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'Invalid request parameters', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 'Authentication required', 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'Too many requests. Please try again later.', 429);
    this.name = 'RateLimitError';
  }
}

// Safe error response handler
export function handleError(error: unknown, context?: string): Response {
  // Log full error details server-side for debugging
  console.error(`Error ${context ? `in ${context}` : ''}:`, error);

  let statusCode = 500;
  let userMessage = 'An error occurred while processing your request';

  // Map known error types to user-friendly messages
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    userMessage = error.userMessage;
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    userMessage = 'Invalid request parameters';
  } else if (error instanceof Error) {
    // Don't expose internal error messages
    if (error.message.includes('JWT')) {
      statusCode = 401;
      userMessage = 'Authentication required';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      userMessage = 'Resource not found';
    }
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: userMessage
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
