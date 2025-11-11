"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { QuestionManager } from "@/components/question-manager"
import { toast } from "@/lib/utils/toast"

interface QuizManagementProps {
  quizId?: string
  lessonId: string
  courseId: string
  initialQuiz?: any
}

export function QuizManagement({ quizId, lessonId, courseId, initialQuiz }: QuizManagementProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState(initialQuiz)

  const [formData, setFormData] = useState({
    title: quiz?.title || "",
    title_ne: quiz?.title_ne || "",
    description: quiz?.description || "",
    description_ne: quiz?.description_ne || "",
    passing_score: quiz?.passing_score?.toString() || "70",
    time_limit_minutes: quiz?.time_limit_minutes?.toString() || "",
    shuffle_questions: quiz?.shuffle_questions || false,
    allow_retry: quiz?.allow_retry ?? true,
    retry_cooldown_hours: quiz?.retry_cooldown_hours?.toString() || "24",
    show_explanations: quiz?.show_explanations ?? true,
  })

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || "",
        title_ne: quiz.title_ne || "",
        description: quiz.description || "",
        description_ne: quiz.description_ne || "",
        passing_score: quiz.passing_score?.toString() || "70",
        time_limit_minutes: quiz.time_limit_minutes?.toString() || "",
        shuffle_questions: quiz.shuffle_questions || false,
        allow_retry: quiz.allow_retry ?? true,
        retry_cooldown_hours: quiz.retry_cooldown_hours?.toString() || "24",
        show_explanations: quiz.show_explanations ?? true,
      })
    }
  }, [quiz])

  const handleSaveQuiz = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const quizData = {
        title: formData.title,
        title_ne: formData.title_ne || null,
        description: formData.description || null,
        description_ne: formData.description_ne || null,
        passing_score: Number.parseInt(formData.passing_score),
        time_limit_minutes: formData.time_limit_minutes ? Number.parseInt(formData.time_limit_minutes) : null,
        shuffle_questions: formData.shuffle_questions,
        allow_retry: formData.allow_retry,
        retry_cooldown_hours: formData.allow_retry
          ? Number.parseInt(formData.retry_cooldown_hours)
          : null,
        show_explanations: formData.show_explanations,
      }

      let response
      if (quizId) {
        // Update existing quiz
        response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        })
      } else {
        // Create new quiz
        response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save quiz")
      }

      const data = await response.json()
      setQuiz(data.quiz)
      toast.success("Quiz saved", "Your quiz settings have been saved.")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save quiz"
      setError(errorMessage)
      toast.error("Failed to save quiz", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!quizId) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete quiz")
      }

      toast.success("Quiz deleted", "The quiz has been removed.")
      router.push(`/instructor/courses/${courseId}/lessons/${lessonId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete quiz"
      setError(errorMessage)
      toast.error("Failed to delete quiz", errorMessage)
      setIsDeleting(false)
    }
  }

  if (!quizId && !quiz) {
    // No quiz exists, show create form
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Lesson 1 Quiz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Test your knowledge..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passing">Passing Score (%)</Label>
              <Input
                id="passing"
                type="number"
                min="0"
                max="100"
                required
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

            <div className="flex gap-4">
              <Button onClick={handleSaveQuiz} disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
                {isLoading ? "Creating..." : "Create Quiz"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Lesson 1 Quiz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Test your knowledge..."
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passing">Passing Score (%)</Label>
              <Input
                id="passing"
                type="number"
                min="0"
                max="100"
                required
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={formData.time_limit_minutes}
                onChange={(e) => setFormData({ ...formData, time_limit_minutes: e.target.value })}
                placeholder="No time limit"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shuffle">Shuffle Questions</Label>
              <p className="text-sm text-muted-foreground">Randomize question order for each attempt</p>
            </div>
            <Switch
              id="shuffle"
              checked={formData.shuffle_questions}
              onCheckedChange={(checked) => setFormData({ ...formData, shuffle_questions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRetry">Allow Retry</Label>
              <p className="text-sm text-muted-foreground">Let learners retake the quiz</p>
            </div>
            <Switch
              id="allowRetry"
              checked={formData.allow_retry}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_retry: checked })}
            />
          </div>

          {formData.allow_retry && (
            <div className="space-y-2">
              <Label htmlFor="cooldown">Retry Cooldown (hours)</Label>
              <Input
                id="cooldown"
                type="number"
                min="0"
                value={formData.retry_cooldown_hours}
                onChange={(e) => setFormData({ ...formData, retry_cooldown_hours: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showExplanations">Show Explanations</Label>
              <p className="text-sm text-muted-foreground">Display explanations after quiz completion</p>
            </div>
            <Switch
              id="showExplanations"
              checked={formData.show_explanations}
              onCheckedChange={(checked) => setFormData({ ...formData, show_explanations: checked })}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
              <Button onClick={handleSaveQuiz} disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Back
              </Button>
            </div>

            {quizId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isLoading || isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Quiz"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the quiz and all its questions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {quizId && (
        <div>
          <h2 className="text-2xl font-bold text-[#190482] mb-4">Questions</h2>
          <QuestionManager quizId={quizId} />
        </div>
      )}
    </div>
  )
}

