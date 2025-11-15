"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { ThumbsUp, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import type { CourseRating } from "@/lib/types"

interface ReviewListProps {
  courseId: string
  currentUserId?: string
  onEdit?: (rating: CourseRating) => void
  onDelete?: () => void
}

export function ReviewList({ courseId, currentUserId, onEdit, onDelete }: ReviewListProps) {
  const [page, setPage] = useState(0)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["course-ratings", courseId, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/courses/${courseId}/ratings?limit=${limit}&offset=${page * limit}`,
      )
      if (!response.ok) {
        throw new Error("Failed to load reviews")
      }
      const result = await response.json()
      return result as { ratings: CourseRating[]; total: number }
    },
    staleTime: 30000,
  })

  const handleHelpful = async (ratingId: string) => {
    try {
      const response = await fetch(`/api/ratings/${ratingId}/helpful`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle helpful")
      }

      refetch()
    } catch (error) {
      toast.error("Failed to toggle helpful")
    }
  }

  const handleDelete = async (ratingId: string) => {
    if (!confirm("Are you sure you want to delete your rating?")) return

    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete rating")
      }

      toast.success("Rating deleted")
      onDelete?.()
      refetch()
    } catch (error) {
      toast.error("Failed to delete rating")
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message="Failed to load reviews" />
  }

  const { ratings, total } = data || { ratings: [], total: 0 }
  const totalPages = Math.ceil(total / limit)

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        </CardContent>
      </Card>
    )
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
    <div className="space-y-4">
      {ratings.map((rating) => {
        const isOwner = currentUserId === rating.user_id

        return (
          <Card key={rating.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rating.user?.avatar_url} />
                  <AvatarFallback>{getInitials(rating.user?.full_name || "U")}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{rating.user?.full_name || "Anonymous"}</p>
                      <StarRating rating={rating.rating} size="sm" />
                    </div>

                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(rating)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(rating.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {rating.review && <p className="text-sm whitespace-pre-wrap">{rating.review}</p>}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(rating.id)}
                      className={`h-6 text-xs ${rating.user_helpful ? "text-[#7752FE]" : ""}`}
                    >
                      <ThumbsUp className={`w-3 h-3 mr-1 ${rating.user_helpful ? "fill-current" : ""}`} />
                      Helpful ({rating.is_helpful_count})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

