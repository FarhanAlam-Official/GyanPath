import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const ratingSchema = z.number().int().min(1).max(5)

export const courseTitleSchema = z.string().min(1, "Title is required").max(200, "Title is too long")

export const courseDescriptionSchema = z.string().max(2000, "Description is too long").optional()

export const commentContentSchema = z
  .string()
  .min(1, "Comment cannot be empty")
  .max(5000, "Comment is too long")

export const reviewSchema = z.string().max(2000, "Review is too long").optional()

export const uuidSchema = z.string().uuid("Invalid ID format")

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/on\w+='[^']*'/gi, "") // Remove event handlers (single quotes)
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

// Rate limiting validation
export function validateRateLimit(requests: number, maxRequests: number): boolean {
  return requests < maxRequests
}

