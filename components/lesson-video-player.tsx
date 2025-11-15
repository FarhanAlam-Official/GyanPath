"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Gauge,
  Bookmark,
  Download,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { saveProgressOffline } from "@/lib/offline/offline-progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface LessonVideoPlayerProps {
  lessonId: string
  courseId: string
  videoUrl: string
  videoDuration: number
  initialProgress: number
  isCompleted: boolean
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const COMPLETION_THRESHOLD = 0.9 // Require 90% completion

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
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`bookmarks-${lessonId}`)
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }, [lessonId])

  // Update progress in database every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentTime > 0) {
        const completionPercentage = currentTime / duration
        const isCompleted = completionPercentage >= COMPLETION_THRESHOLD
        await updateProgress(currentTime, isCompleted)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentTime, duration])

  // Mark as complete when video reaches 90% or ends
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current

      const handleTimeUpdate = () => {
        const completionPercentage = video.currentTime / video.duration
        if (completionPercentage >= COMPLETION_THRESHOLD && !isCompleted) {
          updateProgress(video.currentTime, true)
        }
      }

      const handleEnded = async () => {
        await updateProgress(duration, true)
        setShowCompletionMessage(true)
        setTimeout(() => {
          router.refresh()
        }, 2000)
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("ended", handleEnded)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("ended", handleEnded)
      }
    }
  }, [duration, isCompleted])

  // Update playback speed when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const updateProgress = async (progressSeconds: number, completed: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Save progress offline first (will sync when online)
      try {
        await saveProgressOffline(lessonId, progressSeconds, completed)
      } catch (error) {
        console.warn("Failed to save progress offline:", error)
      }

      // Also try to save to server if online
      if (navigator.onLine) {
        try {
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
          console.warn("Failed to update progress on server:", error)
          // Progress is saved offline, will sync later
        }
      }
    } catch (error) {
      console.error("Failed to update progress:", error)
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
      console.error("Failed to update course progress:", error)
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

      // Improved anti-skip: require 90% completion before allowing full seeking
      // Allow seeking up to max watched time + small buffer (2 seconds)
      const completionPercentage = current / duration
      const canSeekFreely = completionPercentage >= COMPLETION_THRESHOLD

      if (!canSeekFreely && current > maxWatchedTime + 2) {
        videoRef.current.currentTime = maxWatchedTime
      } else if (current > maxWatchedTime) {
        setMaxWatchedTime(current)
      }
    }
  }

  // Handle seeking event to prevent skipping ahead
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current

      const handleSeeking = () => {
        const completionPercentage = video.currentTime / duration
        const canSeekFreely = completionPercentage >= COMPLETION_THRESHOLD

        if (!canSeekFreely && video.currentTime > maxWatchedTime + 1) {
          video.currentTime = Math.min(video.currentTime, maxWatchedTime)
          toast.info("Please watch the video to unlock this section")
        }
      }

      const handleSeeked = () => {
        // Update max watched time if seeking backward to already watched portion
        if (video.currentTime <= maxWatchedTime) {
          setMaxWatchedTime(Math.max(maxWatchedTime, video.currentTime))
        }
      }

      video.addEventListener("seeking", handleSeeking)
      video.addEventListener("seeked", handleSeeked)

      return () => {
        video.removeEventListener("seeking", handleSeeking)
        video.removeEventListener("seeked", handleSeeked)
      }
    }
  }, [maxWatchedTime, duration])

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      // Start from saved progress
      videoRef.current.currentTime = initialProgress
      videoRef.current.playbackRate = playbackSpeed
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const seekTime = (clickX / rect.width) * duration
      const completionPercentage = seekTime / duration
      const canSeekFreely = completionPercentage >= COMPLETION_THRESHOLD

      // Anti-skip: only allow seeking to already watched portions or if 90% completed
      if (canSeekFreely || seekTime <= maxWatchedTime) {
        videoRef.current.currentTime = seekTime
      } else {
        toast.info("Please watch the video to unlock this section")
      }
    }
  }

  const handleAddBookmark = () => {
    if (videoRef.current) {
      const bookmarkTime = Math.floor(videoRef.current.currentTime)
      const newBookmarks = [...bookmarks, bookmarkTime].sort((a, b) => a - b)
      setBookmarks(newBookmarks)
      localStorage.setItem(`bookmarks-${lessonId}`, JSON.stringify(newBookmarks))
      toast.success("Bookmark added")
    }
  }

  const handleRemoveBookmark = (time: number) => {
    const newBookmarks = bookmarks.filter((b) => b !== time)
    setBookmarks(newBookmarks)
    localStorage.setItem(`bookmarks-${lessonId}`, JSON.stringify(newBookmarks))
    toast.success("Bookmark removed")
  }

  const handleJumpToBookmark = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleDownload = async () => {
    try {
      const link = document.createElement("a")
      link.href = videoUrl
      link.download = `lesson-${lessonId}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started")
    } catch (error) {
      toast.error("Failed to download video")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const completionPercentage = (currentTime / duration) * 100
  const canSeekFreely = completionPercentage >= COMPLETION_THRESHOLD * 100

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
            controlsList="nodownload"
            disablePictureInPicture
          />

          {/* Completion Message */}
          {showCompletionMessage && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Lesson Complete!</h3>
                <p className="text-white/80">Great job! Moving to next lesson...</p>
              </div>
            </div>
          )}

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
            {/* Progress Bar */}
            <div className="mb-3 cursor-pointer" onClick={handleSeek}>
              <div className="h-1 bg-white/30 rounded-full overflow-hidden relative">
                <div className="h-full bg-[#7752FE] relative" style={{ width: `${(currentTime / duration) * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
                {/* Max watched indicator */}
                <div
                  className="absolute top-0 h-1 bg-white/50"
                  style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
                />
                {/* Bookmarks */}
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark}
                    className="absolute top-0 w-1 h-1 bg-yellow-400 rounded-full cursor-pointer"
                    style={{ left: `${(bookmark / duration) * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJumpToBookmark(bookmark)
                    }}
                    title={`Bookmark at ${formatTime(bookmark)}`}
                  />
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <span className="text-white/70 text-xs">
                  ({Math.round(completionPercentage)}% watched)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                      <Gauge className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={playbackSpeed === speed ? "bg-accent" : ""}
                      >
                        {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bookmark */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleAddBookmark}
                  className="text-white hover:bg-white/20"
                  title="Add bookmark"
                >
                  <Bookmark className="w-5 h-5" />
                </Button>

                {/* Download */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                  title="Download video"
                >
                  <Download className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length > 0 && (
          <div className="p-4 bg-accent border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Bookmarks</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBookmarks([])
                  localStorage.removeItem(`bookmarks-${lessonId}`)
                }}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((bookmark) => (
                <Button
                  key={bookmark}
                  variant="outline"
                  size="sm"
                  onClick={() => handleJumpToBookmark(bookmark)}
                  className="text-xs"
                >
                  {formatTime(bookmark)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveBookmark(bookmark)
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Anti-skip Notice */}
        <div className="p-4 bg-blue-50 border-t">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> To ensure complete learning, you must watch at least{" "}
            {Math.round(COMPLETION_THRESHOLD * 100)}% of the video before you can skip ahead. Watch the entire lesson
            to mark it as complete.
            {!canSeekFreely && (
              <span className="block mt-1 text-blue-700">
                Progress: {Math.round(completionPercentage)}% - Keep watching to unlock full navigation
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
