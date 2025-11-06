import { createClient } from "./client"

export type StorageBucket = "videos" | "pdfs" | "images" | "thumbnails"

export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  options: UploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ path: string; url: string }> {
  const supabase = createClient()
  const { bucket, path, file, options: uploadOptions } = options

  // Validate file size (e.g., max 500MB for videos, 50MB for PDFs, 10MB for images)
  const maxSizes: Record<StorageBucket, number> = {
    videos: 500 * 1024 * 1024, // 500MB
    pdfs: 50 * 1024 * 1024, // 50MB
    images: 10 * 1024 * 1024, // 10MB
    thumbnails: 5 * 1024 * 1024, // 5MB
  }

  if (file.size > maxSizes[bucket]) {
    throw new Error(`File size exceeds maximum allowed size for ${bucket}`)
  }

  // Upload file
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: uploadOptions?.cacheControl || "3600",
    contentType: uploadOptions?.contentType || file.type,
    upsert: uploadOptions?.upsert || false,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl,
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List files in a bucket
 */
export async function listFiles(bucket: StorageBucket, path?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

