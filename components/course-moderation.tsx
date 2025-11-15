"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import type { Course } from "@/lib/types"

interface CourseModerationProps {
  course: Course & { instructor?: { full_name: string; email: string } }
  onStatusUpdated?: () => void
}

export function CourseModeration({ course, onStatusUpdated }: CourseModerationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(course.is_published ? "published" : "draft")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleStatusUpdate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rejection_reason: status === "rejected" ? rejectionReason : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update course status")
      }

      toast.success("Status updated", "The course status has been updated.")
      onStatusUpdated?.()
    } catch (error) {
      toast.error("Failed to update status", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case "published":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (currentStatus: string) => {
    switch (currentStatus) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Course Moderation
          {getStatusIcon(status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <div className="mt-1">{getStatusBadge(status)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Change Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "rejected" && (
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason</Label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this course was rejected..."
              rows={3}
            />
          </div>
        )}

        <Button
          onClick={handleStatusUpdate}
          disabled={isLoading || status === (course.is_published ? "published" : "draft")}
          className="w-full bg-[#7752FE] hover:bg-[#190482]"
        >
          {isLoading ? "Updating..." : "Update Status"}
        </Button>

        {course.instructor && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Instructor</p>
            <p className="font-medium">{course.instructor.full_name}</p>
            <p className="text-sm text-muted-foreground">{course.instructor.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

