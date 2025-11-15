"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Play, BookOpen } from "lucide-react"
import type { Course } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

interface CourseHeroProps {
  course: Course & { instructor?: { full_name: string } }
}

export function CourseHero({ course }: CourseHeroProps) {
  const { user, loading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!user)
    }
  }, [user, loading])

  const handleEnrollClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      window.location.href = `/auth/login?redirect=/courses/${course.id}`
    }
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      window.location.href = `/auth/login?redirect=/courses/${course.id}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg"
    >
      <div className="relative w-full h-full bg-gradient-to-br from-[#190482] to-[#7752FE]">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title || "Course banner"}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white/50" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
            {course.title}
          </h1>
          {course.instructor?.full_name && (
            <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow">
              By {course.instructor.full_name}
            </p>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#7752FE] hover:bg-[#190482] text-white text-lg h-12 px-8"
              onClick={handleEnrollClick}
            >
              <Link href={isAuthenticated ? `/learner/courses/${course.id}/enroll` : `/auth/login?redirect=/courses/${course.id}`}>
                <Play className="mr-2 w-5 h-5" />
                {isAuthenticated ? "Start Course" : "Enroll Now"}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg h-12 px-8"
              onClick={handleDownloadClick}
            >
              <Link href={isAuthenticated ? `/courses/${course.id}?download=1` : `/auth/login?redirect=/courses/${course.id}`}>
                <Download className="mr-2 w-5 h-5" />
                {isAuthenticated ? "Download for Offline" : "Download Course"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

