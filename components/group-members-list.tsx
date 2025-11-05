"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/lib/utils/toast"
import { Users, Plus, Trash2, UserPlus } from "lucide-react"
import { useState } from "react"

interface GroupMember {
  id: string
  user_id: string
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface GroupMembersListProps {
  groupId: string
}

export function GroupMembersList({ groupId }: GroupMembersListProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: members, isLoading, error } = useQuery<GroupMember[]>({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/members`)
      if (!response.ok) {
        throw new Error("Failed to fetch group members")
      }
      return response.json()
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "group", groupId] })
      toast({
        title: "Success",
        description: "Member removed successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleAddMember = async () => {
    if (!userEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      // First, find the user by email
      const findUserResponse = await fetch(`/api/users/search?email=${encodeURIComponent(userEmail)}`)
      if (!findUserResponse.ok) {
        throw new Error("User not found")
      }

      const user = await findUserResponse.json()

      // Then add the user to the group
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add member")
      }

      toast({
        title: "Success",
        description: "Member added successfully",
      })

      setUserEmail("")
      setAddMemberOpen(false)
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "group", groupId] })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message="Failed to load group members" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Group Members</CardTitle>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member to Group</DialogTitle>
                <DialogDescription>Enter the email address of the user you want to add to this group</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)} disabled={isAdding}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddMember} disabled={isAdding}>
                  {isAdding ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!members || members.length === 0 ? (
          <EmptyState icon={Users} title="No members yet" description="Add members to this group to get started" />
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                  disabled={removeMemberMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

