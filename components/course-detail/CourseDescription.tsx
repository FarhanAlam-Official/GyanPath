import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseDescriptionProps {
  description?: string
}

export function CourseDescription({ description }: CourseDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#190482]">About This Course</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
            {description}
          </div>
        ) : (
          <p className="text-muted-foreground">No description available for this course.</p>
        )}
      </CardContent>
    </Card>
  )
}

