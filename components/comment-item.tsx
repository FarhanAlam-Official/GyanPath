"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Reply, MoreVertical, Edit, Trash2, Pin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommentForm } from "@/components/comment-form"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import type { LessonComment } from "@/lib/types"

interface CommentItemProps {
  comment: LessonComment
  onUpdate?: () => void
  onDelete?: () => void
  lessonId: string
  currentUserId?: string
  isInstructor?: boolean
}

export function CommentItem({
  comment,
  onUpdate,
  onDelete,
  lessonId,
  currentUserId,
  isInstructor,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOwner = currentUserId === comment.user_id
  const canModerate = isOwner || isInstructor

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle like")
      }

      onUpdate?.()
    } catch (error) {
      toast.error("Failed to toggle like")
    }
  }

  const handleEdit = async () => {
    if (!editedContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to update comment")
      }

      setIsEditing(false)
      toast.success("Comment updated")
      onUpdate?.()
    } catch (error) {
      toast.error("Failed to update comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast.success("Comment deleted")
      onDelete?.()
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={comment.is_pinned ? "border-[#7752FE] border-2" : ""}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user?.avatar_url} />
            <AvatarFallback>{getInitials(comment.user?.full_name || "U")}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{comment.user?.full_name || "Anonymous"}</p>
                {comment.is_pinned && (
                  <Pin className="w-3 h-3 text-[#7752FE]" title="Pinned by instructor" />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              {canModerate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner && (
                      <>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editedContent.trim() || isSubmitting}
                    className="bg-[#7752FE] hover:bg-[#190482]"
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-8 ${comment.user_liked ? "text-red-600" : ""}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${comment.user_liked ? "fill-current" : ""}`} />
                {comment.likes_count}
              </Button>

              {!isReplying && (
                <Button variant="ghost" size="sm" onClick={() => setIsReplying(true)} className="h-8">
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {isReplying && (
              <div className="mt-2 pl-4 border-l-2 border-muted">
                <CommentForm
                  lessonId={lessonId}
                  parentCommentId={comment.id}
                  placeholder={`Reply to ${comment.user?.full_name}...`}
                  onSuccess={() => {
                    setIsReplying(false)
                    onUpdate?.()
                  }}
                />
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    lessonId={lessonId}
                    currentUserId={currentUserId}
                    isInstructor={isInstructor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

