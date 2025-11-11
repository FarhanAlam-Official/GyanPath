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
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface LeaderboardProps {
  type?: "global" | "course" | "group"
  courseId?: string
  groupId?: string
  limit?: number
}

export function Leaderboard({ type = "global", courseId, groupId, limit = 100 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [type, courseId, groupId])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("type", type)
      if (courseId) params.append("course_id", courseId)
      if (groupId) params.append("group_id", groupId)
      params.append("limit", limit.toString())

      const response = await fetch(`/api/gamification/leaderboard?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-600" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-700">🥇 Gold</Badge>
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-700">🥈 Silver</Badge>
    if (rank === 3) return <Badge className="bg-amber-100 text-amber-700">🥉 Bronze</Badge>
    return <span className="text-sm text-muted-foreground">#{rank}</span>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading leaderboard...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No leaderboard data yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      {getRankBadge(entry.rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {entry.user?.full_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{entry.user?.full_name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{entry.user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-[#7752FE]">{entry.total_points.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{entry.current_streak} days</span>
                      <span className="text-xs text-muted-foreground">Best: {entry.longest_streak}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

