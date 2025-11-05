"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { EmptyState } from "@/components/empty-state"
import { Users, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Group } from "@/lib/types"

interface GroupListProps {
  showCreateButton?: boolean
}

export function GroupList({ showCreateButton = false }: GroupListProps) {
  const { data: groups, isLoading, error } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups")
      if (!response.ok) {
        throw new Error("Failed to fetch groups")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message="Failed to load groups" />
  }

  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description={showCreateButton ? "Create your first group to get started" : "No groups available"}
      />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/group-admin/groups/${group.id}`}>
                  View
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

