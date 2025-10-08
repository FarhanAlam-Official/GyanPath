"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface PublishCourseButtonProps {
  courseId: string
  isPublished: boolean
}

export function PublishCourseButton({ courseId, isPublished }: PublishCourseButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleTogglePublish = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("courses").update({ is_published: !isPublished }).eq("id", courseId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to toggle publish status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTogglePublish}
      disabled={isLoading}
      variant={isPublished ? "outline" : "default"}
      className={!isPublished ? "bg-[#7752FE] hover:bg-[#190482]" : ""}
    >
      {isLoading ? "Updating..." : isPublished ? "Unpublish" : "Publish Course"}
    </Button>
  )
}
