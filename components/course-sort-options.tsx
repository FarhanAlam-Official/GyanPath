"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowUpDown } from "lucide-react"

type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "duration_asc" | "duration_desc"

interface CourseSortOptionsProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "duration_asc", label: "Duration (Shortest)" },
  { value: "duration_desc", label: "Duration (Longest)" },
]

export function CourseSortOptions({ value, onChange }: CourseSortOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="sort-options" className="text-sm text-muted-foreground whitespace-nowrap">
        Sort by:
      </Label>
      <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
        <SelectTrigger id="sort-options" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

