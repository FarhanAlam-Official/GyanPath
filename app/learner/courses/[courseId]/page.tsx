import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle, Circle, Play } from "lucide-react"
import Link from "next/link"
import { DownloadLessonButton } from "@/components/download-lesson-button"
import { GenerateCertificateButton } from "@/components/generate-certificate-button"
import { CourseRating } from "@/components/course-rating"
import type { Lesson } from "@/lib/types"

export default async function CourseViewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
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

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `,
    )
    .eq("id", courseId)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get published lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index", { ascending: true })

  // Get lesson progress
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id)

  const completedLessonIds = new Set(progressData?.filter((p) => p.is_completed).map((p) => p.lesson_id) || [])

  const isCompleted = enrollment.progress_percentage === 100

  const { data: existingCertificate } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single()

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-[#190482]">{course.title}</CardTitle>
                <p className="text-muted-foreground mt-2">By {course.instructor?.full_name || "Unknown"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Progress</p>
                <p className="text-2xl font-bold text-[#7752FE]">{enrollment.progress_percentage}%</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={enrollment.progress_percentage} className="h-3" />
            {isCompleted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      🎉 Congratulations! You've completed this course!
                    </h3>
                    <p className="text-sm text-green-800">
                      {existingCertificate
                        ? "You've already earned your certificate for this course."
                        : "Generate your certificate to showcase your achievement."}
                    </p>
                  </div>
                  {existingCertificate ? (
                    <Link href={`/learner/certificates/${existingCertificate.id}`}>
                      <Button className="bg-[#7752FE] hover:bg-[#190482]">View Certificate</Button>
                    </Link>
                  ) : (
                    <GenerateCertificateButton courseId={courseId} isCompleted={isCompleted} />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson: Lesson, index: number) => {
                  const isCompleted = completedLessonIds.has(lesson.id)
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lesson.description || "No description"}
                          </p>
                          {lesson.video_duration_seconds && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.floor(lesson.video_duration_seconds / 60)} minutes
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DownloadLessonButton lessonId={lesson.id} courseId={courseId} />
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Button asChild size="sm" className="bg-[#7752FE] hover:bg-[#190482]">
                          <Link href={`/learner/courses/${courseId}/lessons/${lesson.id}`}>
                            <Play className="w-4 h-4 mr-1" />
                            {isCompleted ? "Review" : "Start"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No lessons available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Ratings & Reviews */}
        <CourseRating
          courseId={courseId}
          currentUserId={user.id}
          averageRating={course.average_rating}
          ratingsCount={course.ratings_count}
        />
      </div>
    </DashboardLayout>
  )
}