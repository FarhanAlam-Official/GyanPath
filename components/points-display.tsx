"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, TrendingUp, Flame } from "lucide-react"

interface PointsData {
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
}

interface PointsHistory {
  id: string
  points: number
  reason: string
  source_type?: string
  created_at: string
}

interface PointsDisplayProps {
  userId?: string
}

export function PointsDisplay({ userId }: PointsDisplayProps) {
  const [points, setPoints] = useState<PointsData | null>(null)
  const [history, setHistory] = useState<PointsHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPoints()
  }, [userId])

  const fetchPoints = async () => {
    setIsLoading(true)
    try {
      const params = userId ? `?user_id=${userId}` : ""
      const response = await fetch(`/api/gamification/points${params}`)
      if (response.ok) {
        const data = await response.json()
        setPoints(data.points)
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch points:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading points...</CardContent>
      </Card>
    )
  }

  if (!points) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No points data available</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Coins className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#7752FE]">{points.total_points.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">All-time points earned</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#7752FE]">{points.current_streak}</div>
          <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#7752FE]">{points.longest_streak}</div>
          <p className="text-xs text-muted-foreground mt-1">Best streak achieved</p>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.reason}</p>
                    {item.source_type && (
                      <Badge variant="outline" className="mt-1">
                        {item.source_type}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.points > 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.points > 0 ? "+" : ""}
                      {item.points}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

