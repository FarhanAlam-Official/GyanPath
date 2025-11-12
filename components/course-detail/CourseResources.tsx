import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Video } from "lucide-react"
import Link from "next/link"
import type { Lesson } from "@/lib/types"

interface CourseResourcesProps {
  lessons: Lesson[]
  courseId: string
}

export function CourseResources({ lessons, courseId }: CourseResourcesProps) {
  const hasPdf = lessons.some((lesson) => lesson.pdf_url)
  const hasVideo = lessons.some((lesson) => lesson.video_url)

  if (!hasPdf && !hasVideo) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#190482]">Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPdf && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <FileText className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="font-medium">Course Syllabus</p>
                <p className="text-sm text-muted-foreground">Downloadable PDF</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-[#7752FE] text-[#7752FE] hover:bg-[#C2D9FF]"
            >
              <Link href={`/api/courses/${courseId}/syllabus`} target="_blank">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Link>
            </Button>
          </div>
        )}

        {hasVideo && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C2D9FF] rounded-lg">
                <Video className="w-5 h-5 text-[#190482]" />
              </div>
              <div>
                <p className="font-medium">Preview Video</p>
                <p className="text-sm text-muted-foreground">Low-resolution preview</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-[#7752FE] text-[#7752FE] hover:bg-[#C2D9FF]"
            >
              <Link href={lessons.find((l) => l.video_url)?.video_url || "#"} target="_blank">
                <Video className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

