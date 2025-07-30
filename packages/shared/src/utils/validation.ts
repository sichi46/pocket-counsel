import { z } from 'zod';

export function validateEmail(email: string): boolean {
  const emailSchema = z.string().email();
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateQuestion(question: string): { isValid: boolean; error?: string } {
  if (!question.trim()) {
    return { isValid: false, error: 'Question cannot be empty' };
  }
  
  if (question.length < 10) {
    return { isValid: false, error: 'Question must be at least 10 characters long' };
  }
  
  if (question.length > 1000) {
    return { isValid: false, error: 'Question must be less than 1000 characters' };
  }
  
  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
} 