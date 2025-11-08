import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import { DownloadLessonButton } from "@/components/download-lesson-button"
import { LessonComments } from "@/components/lesson-comments"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function LessonViewPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "learner") {
    redirect("/auth/login")
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .single()

  if (!enrollment) {
    redirect(`/learner/courses/${courseId}/enroll`)
  }

  // Get lesson details
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .eq("is_published", true)
    .single()

  if (error || !lesson) {
    notFound()
  }

  // Get lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("user_id", user.id)
    .single()

  // Get all lessons for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, order_index")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index", { ascending: true })

  const currentIndex = allLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const previousLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
  const nextLesson = currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIndex + 1] : null

  // Check if user is instructor for this course
  const { data: course } = await supabase
    .from("courses")
    .select("instructor_id")
    .eq("id", courseId)
    .single()

  const isInstructor = course?.instructor_id === user.id

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back to Course */}
        <Button asChild variant="ghost" size="sm">
          <Link href={`/learner/courses/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        {/* Lesson Title */}
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">{lesson.title}</h1>
          {lesson.description && <p className="text-muted-foreground mt-2">{lesson.description}</p>}
        </div>

        {/* Video Player */}
        {lesson.video_url && (
          <LessonVideoPlayer
            lessonId={lesson.id}
            courseId={courseId}
            videoUrl={lesson.video_url}
            videoDuration={lesson.video_duration_seconds || 0}
            initialProgress={progress?.video_progress_seconds || 0}
            isCompleted={progress?.is_completed || false}
          />
        )}

        {/* Download for Offline */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Offline Access</h2>
                <p className="text-sm text-muted-foreground">
                  Download this lesson to access it offline
                </p>
              </div>
              <DownloadLessonButton lessonId={lessonId} courseId={courseId} />
            </div>
          </CardContent>
        </Card>

        {/* Lesson Content */}
        {lesson.pdf_url && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              <Button asChild variant="outline">
                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <LessonComments lessonId={lessonId} currentUserId={user.id} isInstructor={isInstructor} />

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          {previousLesson ? (
            <Button asChild variant="outline">
              <Link href={`/learner/courses/${courseId}/lessons/${previousLesson.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Lesson
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
              <Link href={`/learner/courses/${courseId}/lessons/${nextLesson.id}`}>
                Next Lesson
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
              <Link href={`/learner/courses/${courseId}`}>Complete Course</Link>
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
