"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "./CourseCard"
import { CourseCardSkeleton } from "./CourseCardSkeleton"
import { CourseFilters } from "./CourseFilters"
import { CourseSearchBar } from "@/components/course-search-bar"
import { CourseSortOptions } from "@/components/course-sort-options"
import type { Course } from "@/lib/types"
import type { DifficultyLevel } from "@/lib/types"

interface CourseCataloguePageProps {
  initialCourses: (Course & { instructor?: { full_name: string } })[]
  initialCategories: string[]
}

type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "duration_asc" | "duration_desc"

export function CourseCataloguePage({ initialCourses, initialCategories }: CourseCataloguePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(undefined)
  const [sort, setSort] = useState<SortOption>("newest")

  // Build search params
  const searchParams = new URLSearchParams()
  if (searchQuery) searchParams.set("query", searchQuery)
  if (category) searchParams.set("category", category)
  if (difficulty) searchParams.set("difficulty", difficulty)
  searchParams.set("sort", sort)

  // Fetch courses with search/filter
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-search", searchQuery, category, difficulty, sort],
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
    setSort("newest")
  }

  const hasActiveFilters = searchQuery || category || difficulty || sort !== "newest"

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#190482]">Course Catalogue</h1>
        <p className="text-muted-foreground">Discover courses and start your learning journey</p>
      </div>

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
        onCategoryChange={setCategory}
        onDifficultyChange={setDifficulty}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course & { instructor?: { full_name: string } }) => {
            // Get lesson count - this would ideally come from the API
            // For now, we'll fetch it separately or use a placeholder
            return <CourseCard key={course.id} course={course} />
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

