"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, BarChart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Course } from "@/lib/types"
import { CourseSearchBar } from "@/components/course-search-bar"
import { CourseFilters } from "@/components/course-filters"
import { CourseSortOptions } from "@/components/course-sort-options"
import type { DifficultyLevel } from "@/lib/types"
interface CourseBrowseContentProps {
  initialCourses: (Course & { instructor: { full_name: string } })[]
  initialCategories: string[]
  userId: string
  enrolledCourseIds: string[]
}

type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "duration_asc" | "duration_desc"

export function CourseBrowseContent({
  initialCourses,
  initialCategories,
  userId,
  enrolledCourseIds,
}: CourseBrowseContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(undefined)
  const [enrolled, setEnrolled] = useState<"true" | "false" | undefined>(undefined)
  const [sort, setSort] = useState<SortOption>("newest")

  // Build search params
  const searchParams = new URLSearchParams()
  if (searchQuery) searchParams.set("query", searchQuery)
  if (category) searchParams.set("category", category)
  if (difficulty) searchParams.set("difficulty", difficulty)
  if (enrolled) searchParams.set("enrolled", enrolled)
  searchParams.set("sort", sort)
  searchParams.set("user_id", userId)

  // Fetch courses with search/filter
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-search", searchQuery, category, difficulty, enrolled, sort, userId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/search?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to search courses")
      }
      const result = await response.json()
      return result
    },
    initialData: {
      courses: initialCourses,
      categories: initialCategories,
      total: initialCourses.length,
    },
    staleTime: 30000, // Cache for 30 seconds
  })

  const courses = data?.courses || initialCourses
  const categories = data?.categories || initialCategories

  const handleClearFilters = () => {
    setSearchQuery("")
    setCategory(undefined)
    setDifficulty(undefined)
    setEnrolled(undefined)
    setSort("newest")
  }

  const hasActiveFilters = searchQuery || category || difficulty || enrolled || sort !== "newest"

  return (
    <div className="space-y-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 max-w-md">
          <CourseSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <CourseSortOptions value={sort} onChange={setSort} />
      </div>

      {/* Filters */}
      <CourseFilters
        categories={categories}
        selectedCategory={category}
        selectedDifficulty={difficulty}
        selectedEnrolled={enrolled}
        onCategoryChange={setCategory}
        onDifficultyChange={setDifficulty}
        onEnrolledChange={setEnrolled}
        onClear={handleClearFilters}
      />

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Found {courses.length} {courses.length === 1 ? "course" : "courses"}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive">Failed to load courses. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course & { instructor: { full_name: string } }) => {
            const isEnrolled = enrolledCourseIds.includes(course.id)
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="relative aspect-video bg-gradient-to-br from-[#190482] to-[#7752FE] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.estimated_duration_hours || "N/A"}h</span>
                    </div>
                    {course.difficulty_level && (
                      <div className="flex items-center gap-1">
                        <BarChart className="w-3 h-3" />
                        <span className="capitalize">{course.difficulty_level}</span>
                      </div>
                    )}
                    {course.category && (
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-muted rounded text-xs">{course.category}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">By {course.instructor?.full_name || "Unknown"}</p>
                  <Button asChild className="w-full bg-[#7752FE] hover:bg-[#190482]" disabled={isEnrolled}>
                    <Link
                      href={isEnrolled ? `/learner/courses/${course.id}` : `/learner/courses/${course.id}/enroll`}
                    >
                      {isEnrolled ? "View Course" : "Enroll Now"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : !isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {hasActiveFilters ? "No courses found matching your filters" : "No courses available yet"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

