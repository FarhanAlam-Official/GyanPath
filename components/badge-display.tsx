"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeComponent } from "@/components/ui/badge"
import { Award, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Badge {
  id: string
  name: string
  name_ne?: string
  description?: string
  description_ne?: string
  icon_url?: string
  is_earned: boolean
  earned_at?: string
}

interface BadgeDisplayProps {
  userId?: string
}

export function BadgeDisplay({ userId }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBadges()
  }, [userId])

  const fetchBadges = async () => {
    setIsLoading(true)
    try {
      const params = userId ? `?user_id=${userId}` : ""
      const response = await fetch(`/api/gamification/badges${params}`)
      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges || [])
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading badges...</CardContent>
      </Card>
    )
  }

  const earnedBadges = badges.filter((b) => b.is_earned)
  const unearnedBadges = badges.filter((b) => !b.is_earned)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No badges available</div>
        ) : (
          <div className="space-y-6">
            {earnedBadges.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Earned ({earnedBadges.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="border-2 border-yellow-400 rounded-lg p-4 text-center bg-yellow-50"
                    >
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-yellow-200 flex items-center justify-center">
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt={badge.name} className="w-12 h-12" />
                        ) : (
                          <Award className="w-8 h-8 text-yellow-600" />
                        )}
                      </div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      {badge.description && <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>}
                      {badge.earned_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                        </p>
                      )}
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unearnedBadges.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Available ({unearnedBadges.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unearnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="border rounded-lg p-4 text-center bg-muted/30 opacity-60"
                    >
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt={badge.name} className="w-12 h-12 grayscale" />
                        ) : (
                          <Award className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      {badge.description && <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

