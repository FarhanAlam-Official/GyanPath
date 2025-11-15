"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DifficultyLevel } from "@/lib/types"

interface CourseFiltersProps {
  categories: string[]
  selectedCategory?: string
  selectedDifficulty?: DifficultyLevel
  selectedEnrolled?: "true" | "false"
  onCategoryChange: (category: string | undefined) => void
  onDifficultyChange: (difficulty: DifficultyLevel | undefined) => void
  onEnrolledChange: (enrolled: "true" | "false" | undefined) => void
  onClear: () => void
}

export function CourseFilters({
  categories,
  selectedCategory,
  selectedDifficulty,
  selectedEnrolled,
  onCategoryChange,
  onDifficultyChange,
  onEnrolledChange,
  onClear,
}: CourseFiltersProps) {
  const hasActiveFilters = selectedCategory || selectedDifficulty || selectedEnrolled

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Filters</Label>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-xs text-muted-foreground">
            Category
          </Label>
          <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? undefined : value)}>
            <SelectTrigger id="category-filter" className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label htmlFor="difficulty-filter" className="text-xs text-muted-foreground">
            Difficulty
          </Label>
          <Select
            value={selectedDifficulty || "all"}
            onValueChange={(value) => onDifficultyChange(value === "all" ? undefined : (value as DifficultyLevel))}
          >
            <SelectTrigger id="difficulty-filter" className="w-full">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enrollment Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="enrolled-filter" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select
            value={selectedEnrolled || "all"}
            onValueChange={(value) => onEnrolledChange(value === "all" ? undefined : (value as "true" | "false"))}
          >
            <SelectTrigger id="enrolled-filter" className="w-full">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="false">Not Enrolled</SelectItem>
              <SelectItem value="true">Enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

