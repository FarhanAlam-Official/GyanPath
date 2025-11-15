import { useState, useCallback } from "react"
import { toast } from "@/lib/utils/toast"
import { compressImage } from "@/lib/utils/compression"
import type { StorageBucket } from "@/lib/supabase/storage"

interface UseFileUploadOptions {
  bucket: StorageBucket
  folder?: string
  compress?: boolean
  maxSize?: number
  onSuccess?: (url: string, path: string) => void
  onError?: (error: Error) => void
}

export function useFileUpload({
  bucket,
  folder,
  compress = false,
  maxSize,
  onSuccess,
  onError,
}: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (file: File, customPath?: string) => {
      // Validate file size
      if (maxSize && file.size > maxSize) {
        const error = new Error(`File size exceeds maximum allowed size`)
        toast.error("Upload failed", error.message)
        onError?.(error)
        return
      }

      setUploading(true)
      setProgress(0)

      try {
        let fileToUpload = file

        // Compress image if needed
        if (compress && file.type.startsWith("image/")) {
          try {
            fileToUpload = await compressImage(fileToUpload)
          } catch (error) {
            console.warn("Image compression failed, using original file")
          }
        }

        // Create FormData
        const formData = new FormData()
        formData.append("file", fileToUpload)
        formData.append("bucket", bucket)
        if (folder) formData.append("folder", folder)
        if (customPath) formData.append("path", customPath)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        // Upload file
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const data = await response.json()
        toast.success("Upload successful", "File uploaded successfully")
        onSuccess?.(data.url, data.path)
        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        toast.error("Upload failed", errorMessage)
        onError?.(error instanceof Error ? error : new Error(errorMessage))
        throw error
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [bucket, folder, compress, maxSize, onSuccess, onError]
  )

  return {
    upload,
    uploading,
    progress,
  }
}

