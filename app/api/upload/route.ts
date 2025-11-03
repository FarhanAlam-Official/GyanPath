import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const folder = formData.get("folder") as string | null
    const path = formData.get("path") as string | null

    if (!file) {
      throw new ApiError("No file provided", 400)
    }

    if (!bucket) {
      throw new ApiError("No bucket specified", 400)
    }

    // Validate bucket name
    const validBuckets = ["videos", "pdfs", "images", "thumbnails"]
    if (!validBuckets.includes(bucket)) {
      throw new ApiError("Invalid bucket", 400)
    }

    // Generate file path
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    const filePath = path || (folder ? `${folder}/${filename}` : filename)

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      throw new ApiError(`Upload failed: ${uploadError.message}`, 500)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(uploadData.path)

    return NextResponse.json({
      url: publicUrl,
      path: uploadData.path,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

