"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pin, Lock, User, CheckCircle, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/lib/utils/toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  created_at: string
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface Reply {
  id: string
  thread_id: string
  author_id: string
  content: string
  is_solution: boolean
  created_at: string
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface ForumThreadViewProps {
  thread: Thread
  replies: Reply[]
  currentUserId: string
}

export function ForumThreadView({ thread, replies: initialReplies, currentUserId }: ForumThreadViewProps) {
  const router = useRouter()
  const [replies, setReplies] = useState(initialReplies)
  const [newReply, setNewReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReply = async () => {
    if (!newReply.trim()) {
      toast.error("Reply required", "Please enter a reply")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/forums/threads/${thread.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newReply }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to post reply")
      }

      const data = await response.json()
      setReplies([...replies, data.reply])
      setNewReply("")
      toast.success("Reply posted", "Your reply has been added")
    } catch (error) {
      toast.error("Failed to post reply", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>
      </div>

      {/* Thread */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
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
                <CardTitle className="text-2xl">{thread.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{thread.author?.full_name || "Unknown"}</span>
                </div>
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                <span>{thread.view_count} views</span>
                <span>{thread.reply_count} replies</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: thread.content }} />
        </CardContent>
      </Card>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle>Replies ({replies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No replies yet. Be the first to reply!</div>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id} className={reply.is_solution ? "border-green-500 bg-green-50/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{reply.author?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {reply.is_solution && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Solution
                      </Badge>
                    )}
                  </div>
                  <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: reply.content }} />
                </CardContent>
              </Card>
            ))
          )}

          {/* Reply Form */}
          {!thread.is_locked && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !newReply.trim()}
                className="bg-[#7752FE] hover:bg-[#190482]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

