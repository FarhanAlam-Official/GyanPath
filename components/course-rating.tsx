"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { RatingForm } from "@/components/rating-form"
import { ReviewList } from "@/components/review-list"
import { Star, MessageSquare } from "lucide-react"
import type { CourseRating } from "@/lib/types"

interface CourseRatingProps {
  courseId: string
  currentUserId?: string
  averageRating?: number
  ratingsCount?: number
}

export function CourseRating({ courseId, currentUserId, averageRating, ratingsCount }: CourseRatingProps) {
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [editingRating, setEditingRating] = useState<CourseRating | null>(null)

  // Get user's existing rating
  const { data: userRating } = useQuery({
    queryKey: ["user-rating", courseId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null

      const response = await fetch(`/api/courses/${courseId}/ratings`)
      if (!response.ok) return null

      const result = await response.json()
      const rating = result.ratings?.find((r: CourseRating) => r.user_id === currentUserId)
      return rating || null
    },
    enabled: !!currentUserId,
    staleTime: 60000,
  })

  const handleEdit = (rating: CourseRating) => {
    setEditingRating(rating)
    setShowRatingForm(true)
  }

  const handleSuccess = () => {
    setShowRatingForm(false)
    setEditingRating(null)
  }

  const handleCancel = () => {
    setShowRatingForm(false)
    setEditingRating(null)
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Course Ratings
            </CardTitle>
            {averageRating !== undefined && ratingsCount !== undefined && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#7752FE]">{averageRating.toFixed(1)}</div>
                  <StarRating rating={averageRating} size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {ratingsCount} {ratingsCount === 1 ? "review" : "reviews"}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!showRatingForm && !userRating && currentUserId && (
            <Button
              onClick={() => setShowRatingForm(true)}
              className="bg-[#7752FE] hover:bg-[#190482]"
            >
              <Star className="w-4 h-4 mr-2" />
              Rate This Course
            </Button>
          )}

          {showRatingForm && (
            <RatingForm
              courseId={courseId}
              existingRating={editingRating || userRating}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}

          {!showRatingForm && userRating && (
            <div className="space-y-2 p-4 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Your Rating</p>
                  <StarRating rating={userRating.rating} size="sm" />
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(userRating)}>
                  Edit
                </Button>
              </div>
              {userRating.review && (
                <p className="text-sm text-muted-foreground mt-2">{userRating.review}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#7752FE]" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList
            courseId={courseId}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  )
}

