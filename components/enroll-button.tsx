"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface EnrollButtonProps {
  courseId: string
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnroll = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("course_enrollments").insert({
        course_id: courseId,
        user_id: user.id,
        progress_percentage: 0,
      })

      if (error) throw error

      router.push(`/learner/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
      <Button onClick={handleEnroll} disabled={isLoading} className="w-full bg-[#7752FE] hover:bg-[#190482]" size="lg">
        {isLoading ? "Enrolling..." : "Enroll in This Course"}
      </Button>
    </div>
  )
}
