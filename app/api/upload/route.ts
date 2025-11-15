import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"]
const ALLOWED_PDF_TYPES = ["application/pdf"]
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_PDF_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'video', 'pdf', 'image'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !["video", "pdf", "image"].includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file type and size
    let allowedTypes: string[]
    let maxSize: number
    let bucket: string

    switch (type) {
      case "video":
        allowedTypes = ALLOWED_VIDEO_TYPES
        maxSize = MAX_VIDEO_SIZE
        bucket = "videos"
        break
      case "pdf":
        allowedTypes = ALLOWED_PDF_TYPES
        maxSize = MAX_PDF_SIZE
        bucket = "pdfs"
        break
      case "image":
        allowedTypes = ALLOWED_IMAGE_TYPES
        maxSize = MAX_IMAGE_SIZE
        bucket = "images"
        break
      default:
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const filename = `${timestamp}-${random}-${file.name}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(`${user.id}/${filename}`, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(`${user.id}/${filename}`)

    return NextResponse.json(
      {
        url: publicUrl,
        path: data.path,
        filename: file.name,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
