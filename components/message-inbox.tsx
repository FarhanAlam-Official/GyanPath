"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Search, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/lib/utils/toast"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject?: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  recipient?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface MessageInboxProps {
  currentUserId: string
  conversationWith?: string
}

export function MessageInbox({ currentUserId, conversationWith }: MessageInboxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Map<string, Message[]>>(new Map())
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationWith || null)
  const [newMessage, setNewMessage] = useState("")
  const [newSubject, setNewSubject] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation)
    }
  }, [selectedConversation, messages])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        const messagesList = data.messages || []
        setMessages(messagesList)

        // Group messages by conversation
        const grouped = new Map<string, Message[]>()
        messagesList.forEach((msg: Message) => {
          const otherUserId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id
          if (!grouped.has(otherUserId)) {
            grouped.set(otherUserId, [])
          }
          grouped.get(otherUserId)!.push(msg)
        })

        // Sort each conversation by date
        grouped.forEach((msgs, userId) => {
          msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        })

        setConversations(grouped)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markConversationAsRead = async (otherUserId: string) => {
    try {
      const unreadMessages = messages.filter(
        (m) => m.recipient_id === currentUserId && m.sender_id === otherUserId && !m.is_read
      )

      for (const msg of unreadMessages) {
        await fetch(`/api/messages/${msg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        })
      }

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.recipient_id === currentUserId && m.sender_id === otherUserId ? { ...m, is_read: true } : m
        )
      )
    } catch (error) {
      console.error("Failed to mark messages as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) {
      toast.error("Message required", "Please enter a message")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: selectedConversation,
          subject: newSubject || undefined,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()
      setMessages((prev) => [data.message, ...prev])
      setNewMessage("")
      setNewSubject("")
      await fetchMessages()
      toast.success("Message sent", "Your message has been sent")
    } catch (error) {
      toast.error("Failed to send message", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsSending(false)
    }
  }

  const getConversationPartner = (userId: string) => {
    const conversation = conversations.get(userId)?.[0]
    if (!conversation) return null
    return conversation.sender_id === currentUserId ? conversation.recipient : conversation.sender
  }

  const getUnreadCount = (userId: string) => {
    return messages.filter(
      (m) => m.recipient_id === currentUserId && m.sender_id === userId && !m.is_read
    ).length
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading messages...</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[550px]">
            {conversations.size === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No conversations yet</div>
            ) : (
              <div className="divide-y">
                {Array.from(conversations.keys()).map((userId) => {
                  const partner = getConversationPartner(userId)
                  const unreadCount = getUnreadCount(userId)
                  const lastMessage = conversations.get(userId)?.[conversations.get(userId)!.length - 1]

                  return (
                    <button
                      key={userId}
                      onClick={() => setSelectedConversation(userId)}
                      className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                        selectedConversation === userId ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">{partner?.full_name || "Unknown"}</p>
                            {unreadCount > 0 && (
                              <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {lastMessage.content.substring(0, 50)}
                              {lastMessage.content.length > 50 ? "..." : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation
              ? `Conversation with ${getConversationPartner(selectedConversation)?.full_name || "User"}`
              : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[550px]">
          {selectedConversation ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversations.get(selectedConversation)?.map((message) => {
                    const isSent = message.sender_id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isSent ? "bg-[#7752FE] text-white" : "bg-muted"
                          }`}
                        >
                          {message.subject && (
                            <p className={`font-semibold text-sm mb-1 ${isSent ? "text-white" : ""}`}>
                              {message.subject}
                            </p>
                          )}
                          <p className={`text-sm ${isSent ? "text-white" : ""}`}>{message.content}</p>
                          <p className={`text-xs mt-1 ${isSent ? "text-white/70" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              <div className="border-t p-4 space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    placeholder="Message subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="w-full bg-[#7752FE] hover:bg-[#190482]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to view messages
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

