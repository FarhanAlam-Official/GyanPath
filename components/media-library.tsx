"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, FileText, Video, Image as ImageIcon, Copy, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MediaFile {
  id: string
  url: string
  filename: string
  type: "video" | "pdf" | "image"
  uploadedAt: string
}

interface MediaLibraryProps {
  onFileSelect?: (url: string, type: "video" | "pdf" | "image") => void
  selectedFileUrl?: string
}

export function MediaLibrary({ onFileSelect, selectedFileUrl }: MediaLibraryProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<"video" | "pdf" | "image">("image")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", selectedType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()

      const newFile: MediaFile = {
        id: Date.now().toString(),
        url: data.url,
        filename: data.filename,
        type: selectedType,
        uploadedAt: new Date().toISOString(),
      }

      setUploadedFiles([newFile, ...uploadedFiles])
      toast.success("Upload successful", "File uploaded successfully")
      onFileSelect?.(data.url, selectedType)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Copied to clipboard", "File URL copied")
  }

  const handleDelete = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId))
    toast.success("File removed", "File removed from library")
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />
      case "pdf":
        return <FileText className="w-5 h-5" />
      case "image":
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Library</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "library")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>File Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("image")}
                  >
                    Image
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("video")}
                  >
                    Video
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("pdf")}
                  >
                    PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept={
                    selectedType === "image"
                      ? "image/jpeg,image/png,image/webp"
                      : selectedType === "video"
                        ? "video/mp4,video/webm,video/ogg"
                        : "application/pdf"
                  }
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedType === "image" && "Max size: 10MB (JPEG, PNG, WebP)"}
                  {selectedType === "video" && "Max size: 500MB (MP4, WebM, OGG)"}
                  {selectedType === "pdf" && "Max size: 100MB (PDF)"}
                </p>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7752FE] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files uploaded yet</p>
                <p className="text-sm">Upload files to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className={selectedFileUrl === file.url ? "ring-2 ring-[#7752FE]" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">{file.type.toUpperCase()}</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(file.url)}
                              className="h-7"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy URL
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, "_blank")}
                              className="h-7"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open
                            </Button>
                            {onFileSelect && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onFileSelect(file.url, file.type)}
                                className="h-7"
                              >
                                Select
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-7 text-red-600">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete File?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the file from your library. The file will still exist in storage.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(file.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

