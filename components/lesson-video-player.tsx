"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface LessonVideoPlayerProps {
  lessonId: string
  courseId: string
  videoUrl: string
  videoDuration: number
  initialProgress: number
  isCompleted: boolean
}

export function LessonVideoPlayer({
  lessonId,
  courseId,
  videoUrl,
  videoDuration,
  initialProgress,
  isCompleted,
}: LessonVideoPlayerProps) {
  const router = useRouter()
  const supabase = createClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialProgress)
  const [duration, setDuration] = useState(videoDuration)
  const [maxWatchedTime, setMaxWatchedTime] = useState(initialProgress)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)

  // Update progress in database every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentTime > 0) {
        await updateProgress(currentTime, false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentTime])

  // Mark as complete when video ends
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current

      const handleEnded = async () => {
        await updateProgress(duration, true)
        setShowCompletionMessage(true)
        setTimeout(() => {
          router.refresh()
        }, 2000)
      }

      video.addEventListener("ended", handleEnded)
      return () => video.removeEventListener("ended", handleEnded)
    }
  }, [duration])

  const updateProgress = async (progressSeconds: number, completed: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Upsert lesson progress
      await supabase.from("lesson_progress").upsert(
        {
          lesson_id: lessonId,
          user_id: user.id,
          video_progress_seconds: Math.floor(progressSeconds),
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString(),
        },
        {
          onConflict: "lesson_id,user_id",
        },
      )

      // Update course progress
      if (completed) {
        await updateCourseProgress(user.id)
      }
    } catch (error) {
      console.error("[v0] Failed to update progress:", error)
    }
  }

  const updateCourseProgress = async (userId: string) => {
    try {
      // Get total lessons and completed lessons
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId)
        .eq("is_published", true)

      const { data: completedLessons } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("is_completed", true)

      const totalLessons = lessons?.length || 0
      const completedCount = completedLessons?.length || 0
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      // Update enrollment progress
      await supabase
        .from("course_enrollments")
        .update({
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
        })
        .eq("course_id", courseId)
        .eq("user_id", userId)
    } catch (error) {
      console.error("[v0] Failed to update course progress:", error)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      setCurrentTime(current)

      // Anti-skip: prevent seeking forward beyond max watched time
      if (current > maxWatchedTime + 1) {
        videoRef.current.currentTime = maxWatchedTime
      } else if (current > maxWatchedTime) {
        setMaxWatchedTime(current)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      // Start from saved progress
      videoRef.current.currentTime = initialProgress
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const seekTime = (clickX / rect.width) * duration

      // Anti-skip: only allow seeking to already watched portions
      if (seekTime <= maxWatchedTime) {
        videoRef.current.currentTime = seekTime
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative bg-black rounded-t-lg overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
          />

          {/* Completion Message */}
          {showCompletionMessage && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Lesson Complete!</h3>
                <p className="text-white/80">Great job! Moving to next lesson...</p>
              </div>
            </div>
          )}

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3 cursor-pointer" onClick={handleSeek}>
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#7752FE] relative" style={{ width: `${(currentTime / duration) * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
                {/* Max watched indicator */}
                <div
                  className="absolute top-0 h-1 w-1 bg-white/50"
                  style={{ left: `${(maxWatchedTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Anti-skip Notice */}
        <div className="p-4 bg-blue-50 border-t">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> To ensure complete learning, you cannot skip ahead in the video. Watch the entire
            lesson to mark it as complete.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
