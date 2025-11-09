"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Clock, Award, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"

interface QuizStatisticsProps {
  quizId: string
}

interface QuizStats {
  totalAttempts: number
  averageScore: number
  passRate: number
  averageTime: number
  questionStats: Array<{
    questionId: string
    questionText: string
    correctCount: number
    incorrectCount: number
    accuracy: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
  }>
}

const COLORS = ["#7752FE", "#8E8FFA", "#C2D9FF", "#190482", "#FF6B6B"]

export function QuizStatistics({ quizId }: QuizStatisticsProps) {
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)

        // Get all attempts for this quiz
        const { data: attempts, error: attemptsError } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("quiz_id", quizId)
          .order("completed_at", { ascending: false })

        if (attemptsError) throw attemptsError

        if (!attempts || attempts.length === 0) {
          setStats({
            totalAttempts: 0,
            averageScore: 0,
            passRate: 0,
            averageTime: 0,
            questionStats: [],
            scoreDistribution: [],
          })
          return
        }

        // Get quiz details
        const { data: quiz } = await supabase.from("quizzes").select("passing_score").eq("id", quizId).single()

        // Calculate basic stats
        const totalAttempts = attempts.length
        const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        const passedCount = attempts.filter((a) => a.passed).length
        const passRate = (passedCount / totalAttempts) * 100
        const averageTime =
          attempts
            .filter((a) => a.time_taken_seconds)
            .reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0) /
          attempts.filter((a) => a.time_taken_seconds).length || 0

        // Get all questions for this quiz
        const { data: questions } = await supabase
          .from("quiz_questions")
          .select("id, question_text")
          .eq("quiz_id", quizId)

        // Get all answers for all attempts
        const attemptIds = attempts.map((a) => a.id)
        const { data: answers } = await supabase
          .from("quiz_answers")
          .select("*")
          .in("attempt_id", attemptIds)

        // Calculate question-level stats
        const questionStats =
          questions?.map((q) => {
            const questionAnswers = answers?.filter((a) => a.question_id === q.id) || []
            const correctCount = questionAnswers.filter((a) => a.is_correct).length
            const incorrectCount = questionAnswers.length - correctCount
            const accuracy = questionAnswers.length > 0 ? (correctCount / questionAnswers.length) * 100 : 0

            return {
              questionId: q.id,
              questionText: q.question_text.substring(0, 50) + (q.question_text.length > 50 ? "..." : ""),
              correctCount,
              incorrectCount,
              accuracy,
            }
          }) || []

        // Calculate score distribution
        const scoreRanges = [
          { range: "0-20", min: 0, max: 20 },
          { range: "21-40", min: 21, max: 40 },
          { range: "41-60", min: 41, max: 60 },
          { range: "61-80", min: 61, max: 80 },
          { range: "81-100", min: 81, max: 100 },
        ]

        const scoreDistribution = scoreRanges.map((range) => ({
          range: range.range,
          count: attempts.filter((a) => a.score >= range.min && a.score <= range.max).length,
        }))

        setStats({
          totalAttempts,
          averageScore: Math.round(averageScore),
          passRate: Math.round(passRate * 10) / 10,
          averageTime: Math.round(averageTime),
          questionStats,
          scoreDistribution,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [quizId, supabase])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quiz attempts yet. Statistics will appear here once learners take the quiz.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.averageTime / 60)}m {stats.averageTime % 60}s</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7752FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Question Performance */}
      {stats.questionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.questionStats.map((qStat, index) => (
                <div key={qStat.questionId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Q{index + 1}: {qStat.questionText}
                    </p>
                    <p className="text-sm font-bold text-[#7752FE]">{Math.round(qStat.accuracy)}%</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-100 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(qStat.correctCount / (qStat.correctCount + qStat.incorrectCount)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {qStat.correctCount}/{qStat.correctCount + qStat.incorrectCount}
                    </span>
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

