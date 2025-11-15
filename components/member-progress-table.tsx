"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, BookOpen, TrendingUp } from "lucide-react"

interface MemberProgress {
  id: string
  user_id: string
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  stats: {
    totalCourses: number
    completedCourses: number
    certificates: number
    averageProgress: number
  }
}

interface MemberProgressTableProps {
  groupId: string
}

export function MemberProgressTable({ groupId }: MemberProgressTableProps) {
  const [members, setMembers] = useState<MemberProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/members/progress`)
        if (!response.ok) throw new Error("Failed to fetch progress")

        const data = await response.json()
        setMembers(data.members || [])
      } catch (error) {
        console.error("Error fetching member progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [groupId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading progress...</CardContent>
      </Card>
    )
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No members in this group</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Certificates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{member.user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {member.stats.completedCourses}/{member.stats.totalCourses}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{member.stats.averageProgress}%</span>
                    </div>
                    <Progress value={member.stats.averageProgress} className="w-full h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <Badge variant="outline">{member.stats.certificates}</Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

