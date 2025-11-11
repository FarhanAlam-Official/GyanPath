"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart3, Download, TrendingUp, Users, BookOpen, Award, FileText } from "lucide-react"
import { toast } from "@/lib/utils/toast"

interface AnalyticsReport {
  totalUsers?: number
  totalCourses?: number
  totalEnrollments?: number
  totalCertificates?: number
  totalEnrollments?: number
  totalCompletions?: number
  completionRate?: number
  averageProgress?: number
  enrollmentOverTime?: Array<{ date: string; count: number }>
  activeUsers30Days?: number
  newEnrollments7Days?: number
}

interface AdvancedAnalyticsProps {
  courseId?: string
  role?: "admin" | "instructor" | "group_admin"
}

export function AdvancedAnalytics({ courseId, role = "admin" }: AdvancedAnalyticsProps) {
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [reportType, setReportType] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportType, courseId])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("type", reportType)
      if (courseId) params.append("course_id", courseId)

      const response = await fetch(`/api/analytics/reports?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const type = reportType === "overview" ? "users" : reportType === "course_performance" ? "enrollments" : "users"
      const response = await fetch(`/api/analytics/export?format=${format}&type=${type}`)

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success("Export successful", "Data has been downloaded")
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success("Export successful", "Data has been downloaded")
      }
    } catch (error) {
      toast.error("Export failed", error instanceof Error ? error.message : "Unknown error")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading analytics...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7752FE]" />
            Advanced Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                {courseId && <SelectItem value="course_performance">Course Performance</SelectItem>}
                <SelectItem value="user_engagement">User Engagement</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportType === "overview" && report && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#7752FE]">{report.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#7752FE]">{report.totalCourses || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#7752FE]">{report.totalEnrollments || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                  <Award className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#7752FE]">{report.totalCertificates || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === "course_performance" && report && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#7752FE]">{report.totalEnrollments || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#7752FE]">
                      {report.completionRate ? Math.round(report.completionRate) : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.totalCompletions || 0} completions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#7752FE]">{report.averageProgress || 0}%</div>
                  </CardContent>
                </Card>
              </div>

              {report.enrollmentOverTime && report.enrollmentOverTime.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.enrollmentOverTime.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-[#7752FE] h-2 rounded-full"
                                style={{
                                  width: `${(item.count / Math.max(...report.enrollmentOverTime!.map((i) => i.count))) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {reportType === "user_engagement" && report && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Active Users (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7752FE]">{report.activeUsers30Days || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Users active in the last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">New Enrollments (7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7752FE]">{report.newEnrollments7Days || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Enrollments in the last week</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

