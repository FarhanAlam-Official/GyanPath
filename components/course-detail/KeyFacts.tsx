import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Award, Download, Globe } from "lucide-react"
import { OfflineBadge } from "@/components/shared/OfflineBadge"
import type { Course } from "@/lib/types"

interface KeyFactsProps {
  course: Course
  lessonCount: number
  totalVideoMinutes?: number
  enrollmentCount?: number
}

export function KeyFacts({ course, lessonCount, totalVideoMinutes, enrollmentCount }: KeyFactsProps) {
  const languages: string[] = []
  if (course.title) languages.push("English")
  if (course.title_ne) languages.push("Nepali")

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-[#190482] mb-4">Key Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Lesson Count */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#C2D9FF] rounded-lg">
              <BookOpen className="w-5 h-5 text-[#190482]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lessons</p>
              <p className="text-lg font-semibold text-[#190482]">{lessonCount}</p>
            </div>
          </div>

          {/* Duration */}
          {course.estimated_duration_hours && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <Clock className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-[#190482]">{course.estimated_duration_hours} hours</p>
              </div>
            </div>
          )}

          {/* Video Minutes */}
          {totalVideoMinutes && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <Clock className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Video Content</p>
                <p className="text-lg font-semibold text-[#190482]">{totalVideoMinutes} minutes</p>
              </div>
            </div>
          )}

          {/* Offline Available */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#C2D9FF] rounded-lg">
              <Download className="w-5 h-5 text-[#190482]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Offline</p>
              <OfflineBadge />
            </div>
          </div>

          {/* Certificate */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#C2D9FF] rounded-lg">
              <Award className="w-5 h-5 text-[#190482]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificate</p>
              <p className="text-lg font-semibold text-[#190482]">Available</p>
            </div>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <Globe className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Languages</p>
                <p className="text-lg font-semibold text-[#190482]">{languages.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Enrollment Count */}
          {enrollmentCount !== undefined && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <BookOpen className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-lg font-semibold text-[#190482]">{enrollmentCount} learners</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

