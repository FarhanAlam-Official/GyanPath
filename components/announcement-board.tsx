"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pin, Plus, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/lib/utils/toast"

interface Announcement {
  id: string
  author_id: string
  group_id?: string
  course_id?: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface AnnouncementBoardProps {
  groupId?: string
  courseId?: string
  canCreate?: boolean
}

export function AnnouncementBoard({ groupId, courseId, canCreate = false }: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [groupId, courseId])

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (groupId) params.append("group_id", groupId)
      if (courseId) params.append("course_id", courseId)

      const response = await fetch(`/api/announcements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Fields required", "Please fill in all required fields")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          group_id: groupId,
          course_id: courseId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create announcement")
      }

      toast.success("Announcement created", "Your announcement has been posted")
      setFormData({ title: "", content: "", is_pinned: false })
      setIsDialogOpen(false)
      await fetchAnnouncements()
    } catch (error) {
      toast.error("Failed to create announcement", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading announcements...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Announcements</CardTitle>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#7752FE] hover:bg-[#190482]">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Share important information with your group or course</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement content..."
                    rows={5}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pin">Pin to top</Label>
                  <Switch
                    id="pin"
                    checked={formData.is_pinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating} className="bg-[#7752FE] hover:bg-[#190482]">
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Pin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={announcement.is_pinned ? "border-[#7752FE]" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.is_pinned && (
                          <Badge variant="outline" className="bg-[#7752FE]/10 text-[#7752FE] border-[#7752FE]">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{announcement.author?.full_name || "Unknown"}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

