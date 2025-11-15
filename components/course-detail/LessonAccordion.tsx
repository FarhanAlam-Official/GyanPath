"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle, Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Lesson } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"

interface LessonAccordionProps {
  lessons: Lesson[]
  courseId: string
  completedLessonIds?: Set<string>
}

export function LessonAccordion({ lessons, courseId, completedLessonIds = new Set() }: LessonAccordionProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No lessons available yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#190482]">Course Content</CardTitle>
        <p className="text-sm text-muted-foreground">{lessons.length} lessons</p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.has(lesson.id)
            const lessonUrl = isAuthenticated
              ? `/learner/courses/${courseId}/lessons/${lesson.id}`
              : `/auth/login?redirect=/courses/${courseId}`

            return (
              <AccordionItem key={lesson.id} value={lesson.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="w-10 h-10 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {lesson.description}
                        </p>
                      )}
                      {lesson.video_duration_seconds && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor(lesson.video_duration_seconds / 60)} minutes</span>
                        </div>
                      )}
                    </div>
                    {isAuthenticated && (
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-14 space-y-3">
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    )}
                    <Button
                      asChild
                      size="sm"
                      className="bg-[#7752FE] hover:bg-[#190482]"
                    >
                      <Link href={lessonUrl}>
                        <Play className="w-4 h-4 mr-1" />
                        {isAuthenticated ? (isCompleted ? "Review Lesson" : "Start Lesson") : "Login to View"}
                      </Link>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

