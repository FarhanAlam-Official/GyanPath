"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { toast } from "sonner"

interface CommentFormProps {
  lessonId: string
  parentCommentId?: string
  onSuccess?: () => void
  placeholder?: string
  replyTo?: string
}

export function CommentForm({
  lessonId,
  parentCommentId,
  onSuccess,
  placeholder = "Add a comment...",
  replyTo,
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          content: content.trim(),
          parent_comment_id: parentCommentId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to post comment")
      }

      setContent("")
      toast.success(parentCommentId ? "Reply posted" : "Comment posted")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim() || isSubmitting} size="sm" className="bg-[#7752FE] hover:bg-[#190482]">
          <Send className="w-4 h-4 mr-2" />
          {parentCommentId ? "Reply" : "Post Comment"}
        </Button>
      </div>
    </form>
  )
}

