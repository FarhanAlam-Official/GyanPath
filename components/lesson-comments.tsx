"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommentForm } from "@/components/comment-form"
import { CommentItem } from "@/components/comment-item"
import { MessageSquare, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import type { LessonComment } from "@/lib/types"

interface LessonCommentsProps {
  lessonId: string
  currentUserId?: string
  isInstructor?: boolean
}

export function LessonComments({ lessonId, currentUserId, isInstructor }: LessonCommentsProps) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lesson-comments", lessonId],
    queryFn: async () => {
      const response = await fetch(`/api/comments?lesson_id=${lessonId}`)
      if (!response.ok) {
        throw new Error("Failed to load comments")
      }
      const result = await response.json()
      return result.comments as LessonComment[]
    },
    staleTime: 30000, // Cache for 30 seconds
  })

  const comments = data || []

  const handleCommentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] })
  }

  const handleCommentUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] })
  }

  const handleCommentDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load comments" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#7752FE]" />
          <CardTitle>Discussion ({comments.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <CommentForm lessonId={lessonId} onSuccess={handleCommentAdded} />

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdate={handleCommentUpdated}
                onDelete={handleCommentDeleted}
                lessonId={lessonId}
                currentUserId={currentUserId}
                isInstructor={isInstructor}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

