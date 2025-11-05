"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, File, Image as ImageIcon, Video, FileText } from "lucide-react"
import { compressImage, validateFileType, formatFileSize } from "@/lib/utils/compression"
import { uploadFile, type StorageBucket, type UploadOptions } from "@/lib/supabase/storage"
import { toast } from "@/lib/utils/toast"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  bucket: StorageBucket
  folder?: string
  accept?: string
  maxSize?: number
  onUploadComplete?: (url: string, path: string) => void
  onUploadError?: (error: Error) => void
  compress?: boolean
  className?: string
  label?: string
}

export function FileUpload({
  bucket,
  folder = "",
  accept,
  maxSize,
  onUploadComplete,
  onUploadError,
  compress = false,
  className,
  label,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (file.type.startsWith("video/")) return <Video className="w-5 h-5" />
    if (file.type === "application/pdf") return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      // Validate file type
      if (accept && !validateFileType(selectedFile, accept.split(","))) {
        toast.error("Invalid file type", "Please select a valid file type")
        return
      }

      // Validate file size
      if (maxSize && selectedFile.size > maxSize) {
        toast.error(
          "File too large",
          `File size must be less than ${formatFileSize(maxSize)}`
        )
        return
      }

      let fileToUpload = selectedFile

      // Compress image if needed
      if (compress && selectedFile.type.startsWith("image/")) {
        try {
          fileToUpload = await compressImage(selectedFile)
          toast.info("Image compressed", "File size reduced for faster upload")
        } catch (error) {
          console.error("Compression failed:", error)
          // Continue with original file if compression fails
        }
      }

      setFile(fileToUpload)

      // Create preview for images
      if (fileToUpload.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(fileToUpload)
      } else {
        setPreview(null)
      }
    },
    [accept, maxSize, compress]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleUpload = useCallback(async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split(".").pop()
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
      const path = folder ? `${folder}/${filename}` : filename

      // Simulate progress (Supabase doesn't provide progress callbacks)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await uploadFile({
        bucket,
        path,
        file,
        options: {
          contentType: file.type,
          cacheControl: "3600",
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

      toast.success("Upload successful", "File uploaded successfully")
      onUploadComplete?.(result.url, result.path)
      setFile(null)
      setPreview(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      toast.error("Upload failed", errorMessage)
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [file, bucket, folder, onUploadComplete, onUploadError])

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        >
          <Input
            type="file"
            accept={accept}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) {
                handleFileSelect(selectedFile)
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              Drag and drop a file, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              {accept && `Accepted: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            </p>
          </Label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded">
                {getFileIcon(file)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading} className="flex-1">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

