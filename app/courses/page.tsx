import { createServerClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CourseCataloguePage } from "@/components/course-catalogue/CourseCataloguePage"
import type { Course } from "@/lib/types"

export default async function CoursesPage() {
  const supabase = await createServerClient()

  // Get all published courses (public, no auth required)
  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get unique categories for filters
  const { data: allCourses } = await supabase
    .from("courses")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null)

  const categories = Array.from(new Set(allCourses?.map((c) => c.category).filter(Boolean) || [])).sort()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <CourseCataloguePage
          initialCourses={(courses as (Course & { instructor?: { full_name: string } })[]) || []}
          initialCategories={categories}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

