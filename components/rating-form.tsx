"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { toast } from "sonner"
import type { CourseRating } from "@/lib/types"

interface RatingFormProps {
  courseId: string
  existingRating?: CourseRating | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function RatingForm({ courseId, existingRating, onSuccess, onCancel }: RatingFormProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [review, setReview] = useState(existingRating?.review || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      const url = existingRating ? `/api/ratings/${existingRating.id}` : `/api/courses/${courseId}/ratings`
      const method = existingRating ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          review: review.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit rating")
      }

      toast.success(existingRating ? "Rating updated" : "Rating submitted")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingRating ? "Update Your Rating" : "Rate This Course"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <StarRating rating={rating} interactive onRatingChange={setRating} showValue />
          </div>

          <div>
            <label htmlFor="review" className="text-sm font-medium mb-2 block">
              Your Review (Optional)
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this course..."
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="bg-[#7752FE] hover:bg-[#190482]"
            >
              {existingRating ? "Update Rating" : "Submit Rating"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

