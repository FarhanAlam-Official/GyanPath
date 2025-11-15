import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CourseBreadcrumb } from "@/components/course-detail/CourseBreadcrumb"
import { CourseHero } from "@/components/course-detail/CourseHero"
import { KeyFacts } from "@/components/course-detail/KeyFacts"
import { CourseDescription } from "@/components/course-detail/CourseDescription"
import { LessonAccordion } from "@/components/course-detail/LessonAccordion"
import { InstructorBio } from "@/components/course-detail/InstructorBio"
import { CourseResources } from "@/components/course-detail/CourseResources"
import { EnrollmentCTA } from "@/components/course-detail/EnrollmentCTA"
import type { Course, Lesson } from "@/lib/types"

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()

  // Get course details (slug is actually course ID)
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(id, full_name, email, avatar_url)
    `,
    )
    .eq("id", slug)
    .eq("is_published", true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get published lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", slug)
    .eq("is_published", true)
    .order("order_index", { ascending: true })

  // Calculate total video minutes
  const totalVideoMinutes = lessons?.reduce((acc, lesson) => {
    return acc + (lesson.video_duration_seconds ? Math.floor(lesson.video_duration_seconds / 60) : 0)
  }, 0)

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", slug)

  // Check if user is authenticated and get their progress (optional, for client component)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let completedLessonIds = new Set<string>()

  if (user) {
    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select("lesson_id, is_completed")
      .eq("user_id", user.id)
      .in(
        "lesson_id",
        lessons?.map((l) => l.id) || [],
      )

    completedLessonIds = new Set(
      progressData?.filter((p) => p.is_completed).map((p) => p.lesson_id) || [],
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <CourseBreadcrumb courseTitle={course.title} />

          <CourseHero course={course} />

          <KeyFacts
            course={course}
            lessonCount={lessons?.length || 0}
            totalVideoMinutes={totalVideoMinutes}
            enrollmentCount={enrollmentCount || 0}
          />

          <CourseDescription description={course.description} />

          <LessonAccordion
            lessons={(lessons as Lesson[]) || []}
            courseId={slug}
            completedLessonIds={completedLessonIds}
          />

          {course.instructor && (
            <InstructorBio
              instructor={{
                full_name: course.instructor.full_name || "Unknown Instructor",
                email: course.instructor.email,
                avatar_url: course.instructor.avatar_url,
              }}
            />
          )}

          <CourseResources lessons={(lessons as Lesson[]) || []} courseId={slug} />

          <EnrollmentCTA courseId={slug} enrollmentCount={enrollmentCount || 0} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

