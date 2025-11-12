"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe, BookOpen } from "lucide-react"
import type { Course } from "@/lib/types"
import { OfflineBadge } from "@/components/shared/OfflineBadge"

interface CourseCardProps {
  course: Course & { instructor?: { full_name: string } }
  lessonCount?: number
}

export function CourseCard({ course, lessonCount }: CourseCardProps) {
  const languages: string[] = []
  if (course.title) languages.push("English")
  if (course.title_ne) languages.push("Nepali")

  const tagline = course.description ? course.description.split(".")[0].substring(0, 100) : ""
  const imageSrc =
    course.thumbnail_url && course.thumbnail_url.trim().length > 0
      ? course.thumbnail_url
      : "/course-placeholder.png"

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow p-0 gap-0">
        <CardHeader className="p-0 px-0 pb-0">
          <Link href={`/courses/${course.id}`} className="block">
            <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#190482] to-[#7752FE] overflow-hidden">
              <Image
                src={imageSrc}
                alt={course.title || "Course thumbnail"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            </div>
          </Link>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between gap-4 px-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Link href={`/courses/${course.id}`}>
                <h3 className="font-semibold text-lg text-[#190482] line-clamp-2 hover:text-[#7752FE] transition-colors">
                  {course.title}
                </h3>
              </Link>
              {tagline && <p className="text-sm text-muted-foreground line-clamp-2">{tagline}</p>}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {course.estimated_duration_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.estimated_duration_hours}h</span>
                </div>
              )}
              {lessonCount !== undefined && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{lessonCount} lessons</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {languages.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-[#8E8FFA] text-[#190482] bg-[#C2D9FF]/30"
                >
                  <Globe className="w-3 h-3" />
                  <span>{languages.join(", ")}</span>
                </Badge>
              )}
              <OfflineBadge />
            </div>
          </div>

          <Button
            asChild
            className="w-full bg-[#7752FE] hover:bg-[#190482] text-white"
            aria-label={`View course: ${course.title}`}
          >
            <Link href={`/courses/${course.id}`}>View Course</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
