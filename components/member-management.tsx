"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Upload, Trash2, Search } from "lucide-react"
import { toast } from "@/lib/utils/toast"

interface Member {
  id: string
  user_id: string
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  stats?: {
    totalCourses: number
    completedCourses: number
    certificates: number
    averageProgress: number
  }
}

interface MemberManagementProps {
  groupId: string
  initialMembers?: Member[]
}

export function MemberManagement({ groupId, initialMembers = [] }: MemberManagementProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [addMemberEmail, setAddMemberEmail] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [bulkEmails, setBulkEmails] = useState("")

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/members`)
      if (!response.ok) throw new Error("Failed to fetch members")

      const data = await response.json()
      setMembers(data || [])
    } catch (error) {
      toast.error("Failed to load members", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) {
      toast.error("Email required", "Please enter an email address")
      return
    }

    setIsAdding(true)
    try {
      // Find user by email
      const findResponse = await fetch(`/api/users/search?email=${encodeURIComponent(addMemberEmail)}`)
      if (!findResponse.ok) {
        throw new Error("User not found")
      }

      const user = await findResponse.json()

      // Add to group
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add member")
      }

      toast.success("Member added", "The user has been added to the group.")
      setAddMemberEmail("")
      await fetchMembers()
    } catch (error) {
      toast.error("Failed to add member", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsAdding(false)
    }
  }

  const handleBulkAdd = async () => {
    if (!bulkEmails.trim()) {
      toast.error("Emails required", "Please enter email addresses")
      return
    }

    setIsAdding(true)
    try {
      // Parse emails (one per line or comma-separated)
      const emailList = bulkEmails
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0)

      if (emailList.length === 0) {
        throw new Error("No valid emails found")
      }

      // Find all users by email
      const userPromises = emailList.map((email) =>
        fetch(`/api/users/search?email=${encodeURIComponent(email)}`).then((r) => r.json())
      )

      const users = await Promise.all(userPromises)
      const userIds = users.map((u) => u.id).filter(Boolean)

      if (userIds.length === 0) {
        throw new Error("No users found for the provided emails")
      }

      // Bulk add
      const response = await fetch(`/api/groups/${groupId}/members/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: userIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add members")
      }

      const data = await response.json()
      toast.success(
        "Members added",
        `Added ${data.added} members. ${data.skipped} were already members.`
      )
      setBulkEmails("")
      setIsBulkUploadOpen(false)
      await fetchMembers()
    } catch (error) {
      toast.error("Failed to add members", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove member")
      }

      toast.success("Member removed", "The member has been removed from the group.")
      await fetchMembers()
    } catch (error) {
      toast.error("Failed to remove member", error instanceof Error ? error.message : "Unknown error")
    }
  }

  const filteredMembers = members.filter((member) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      member.user.full_name.toLowerCase().includes(searchLower) ||
      member.user.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Group Members</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Add Members</DialogTitle>
                  <DialogDescription>
                    Enter email addresses (one per line or comma-separated)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-emails">Email Addresses</Label>
                    <textarea
                      id="bulk-emails"
                      className="w-full min-h-[200px] p-2 border rounded-md"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)} disabled={isAdding}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAdd} disabled={isAdding} className="bg-[#7752FE] hover:bg-[#190482]">
                    {isAdding ? "Adding..." : "Add Members"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#7752FE] hover:bg-[#190482]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member to Group</DialogTitle>
                  <DialogDescription>Enter the email address of the user to add</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={addMemberEmail}
                      onChange={(e) => setAddMemberEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddMemberEmail("")} disabled={isAdding}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember} disabled={isAdding} className="bg-[#7752FE] hover:bg-[#190482]">
                    {isAdding ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "No members found matching your search" : "No members in this group yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {member.stats ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Progress:</span>
                            <Badge variant="outline">{member.stats.averageProgress}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.stats.completedCourses}/{member.stats.totalCourses} courses completed
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

