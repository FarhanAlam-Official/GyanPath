"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Download, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface EnrollmentCTAProps {
  courseId: string
  enrollmentCount?: number
  totalCapacity?: number
}

export function EnrollmentCTA({ courseId, enrollmentCount = 0, totalCapacity }: EnrollmentCTAProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user

  const enrollmentPercentage = totalCapacity ? Math.min((enrollmentCount / totalCapacity) * 100, 100) : 0

  const handleActionClick = (e: React.MouseEvent, action: "enroll" | "download") => {
    if (!isAuthenticated) {
      e.preventDefault()
      window.location.href = `/auth/login?redirect=/courses/${courseId}`
    }
  }

  return (
    <Card className="bg-gradient-to-br from-[#C2D9FF] to-[#8E8FFA] border-[#7752FE]">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-[#190482]">Ready to Start Learning?</h3>
            <p className="text-[#190482]/80">
              {isAuthenticated
                ? "Enroll now to access all course materials and start your learning journey."
                : "Sign in to enroll in this course and access all learning materials."}
            </p>

            {/* Enrollment Progress */}
            {enrollmentCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#190482]">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{enrollmentCount} learners enrolled</span>
                  </div>
                  {totalCapacity && (
                    <span className="text-[#190482]/70">{totalCapacity} spots available</span>
                  )}
                </div>
                {totalCapacity && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <Progress value={enrollmentPercentage} className="h-2" />
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#7752FE] hover:bg-[#190482] text-white text-lg h-12 px-8"
              onClick={(e) => handleActionClick(e, "enroll")}
            >
              <Link href={isAuthenticated ? `/learner/courses/${courseId}/enroll` : `/auth/login?redirect=/courses/${courseId}`}>
                <Play className="mr-2 w-5 h-5" />
                {isAuthenticated ? "Enroll Now" : "Sign In to Enroll"}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/90 border-[#190482] text-[#190482] hover:bg-white text-lg h-12 px-8"
              onClick={(e) => handleActionClick(e, "download")}
            >
              <Link href={isAuthenticated ? `/courses/${courseId}?download=1` : `/auth/login?redirect=/courses/${courseId}`}>
                <Download className="mr-2 w-5 h-5" />
                Download Bundle
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

