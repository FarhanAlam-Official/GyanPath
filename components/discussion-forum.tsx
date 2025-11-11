"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Pin, Lock, Plus, User, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/lib/utils/toast"
import Link from "next/link"

interface Forum {
  id: string
  course_id: string
  title: string
  description?: string
  created_at: string
}

interface Thread {
  id: string
  forum_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  last_reply_at?: string
  created_at: string
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface DiscussionForumProps {
  courseId: string
  canCreate?: boolean
}

export function DiscussionForum({ courseId, canCreate = false }: DiscussionForumProps) {
  const [forum, setForum] = useState<Forum | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
  })

  useEffect(() => {
    fetchForum()
  }, [courseId])

  const fetchForum = async () => {
    setIsLoading(true)
    try {
      // Get or create forum for this course
      const forumResponse = await fetch(`/api/forums?course_id=${courseId}`)
      if (forumResponse.ok) {
        const forumData = await forumResponse.json()
        if (forumData.forums && forumData.forums.length > 0) {
          const courseForum = forumData.forums[0]
          setForum(courseForum)
          await fetchThreads(courseForum.id)
        } else {
          // No forum exists yet, will be created by instructor
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Failed to fetch forum:", error)
    }
  }

  const fetchThreads = async (forumId: string) => {
    try {
      const response = await fetch(`/api/forums/${forumId}/threads`)
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateThread = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !forum) {
      toast.error("Fields required", "Please fill in all required fields")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/forums/${forum.id}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create thread")
      }

      toast.success("Thread created", "Your discussion thread has been created")
      setFormData({ title: "", content: "", is_pinned: false })
      setIsDialogOpen(false)
      await fetchThreads(forum.id)
    } catch (error) {
      toast.error("Failed to create thread", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading forum...</CardContent>
      </Card>
    )
  }

  if (!forum) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Discussion forum not available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{forum.title}</CardTitle>
          {forum.description && <p className="text-sm text-muted-foreground mt-1">{forum.description}</p>}
        </div>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#7752FE] hover:bg-[#190482]">
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Discussion Thread</DialogTitle>
                <DialogDescription>Start a new discussion topic</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thread-title">Title *</Label>
                  <Input
                    id="thread-title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Thread title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-content">Content *</Label>
                  <Textarea
                    id="thread-content"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Your question or discussion topic..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateThread} disabled={isCreating} className="bg-[#7752FE] hover:bg-[#190482]">
                    {isCreating ? "Creating..." : "Create Thread"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {threads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No discussion threads yet</p>
            {canCreate && <p className="text-sm mt-2">Be the first to start a discussion!</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/forums/${forum.id}/threads/${thread.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.is_pinned && (
                            <Badge variant="outline" className="bg-[#7752FE]/10 text-[#7752FE] border-[#7752FE]">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {thread.is_locked && (
                            <Badge variant="outline">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          <h3 className="font-semibold text-lg truncate">{thread.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{thread.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{thread.author?.full_name || "Unknown"}</span>
                          </div>
                          <span>{thread.reply_count} replies</span>
                          <span>{thread.view_count} views</span>
                          {thread.last_reply_at && (
                            <span>
                              Last reply {formatDistanceToNow(new Date(thread.last_reply_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

