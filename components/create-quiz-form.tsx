"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Check } from "lucide-react"

interface Question {
  question_text: string
  explanation?: string
  options: { option_text: string; is_correct: boolean }[]
}

export function CreateQuizForm({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [passingScore, setPassingScore] = useState("70")
  const [timeLimit, setTimeLimit] = useState("")
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [allowRetry, setAllowRetry] = useState(true)
  const [retryCooldown, setRetryCooldown] = useState("24")
  const [showExplanations, setShowExplanations] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: "",
      explanation: "",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        explanation: "",
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions]
    updated[index].question_text = text
    setQuestions(updated)
  }

  const updateQuestionExplanation = (index: number, explanation: string) => {
    const updated = [...questions]
    updated[index].explanation = explanation
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options.push({ option_text: "", is_correct: false })
    setQuestions(updated)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex)
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex].option_text = text
    setQuestions(updated)
  }

  const toggleCorrect = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex].is_correct = !updated[questionIndex].options[optionIndex].is_correct
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate
      if (questions.some((q) => !q.question_text.trim())) {
        throw new Error("All questions must have text")
      }
      if (questions.some((q) => q.options.some((o) => !o.option_text.trim()))) {
        throw new Error("All options must have text")
      }
      if (questions.some((q) => !q.options.some((o) => o.is_correct))) {
        throw new Error("Each question must have at least one correct answer")
      }

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          lesson_id: lessonId,
          title,
          description: description || null,
          passing_score: Number.parseInt(passingScore),
          time_limit_minutes: timeLimit ? Number.parseInt(timeLimit) : null,
          shuffle_questions: shuffleQuestions,
          allow_retry: allowRetry,
          retry_cooldown_hours: allowRetry ? Number.parseInt(retryCooldown) : null,
          show_explanations: showExplanations,
          is_published: false,
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]

        const { data: questionData, error: questionError } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: quiz.id,
            question_text: question.question_text,
            explanation: question.explanation || null,
            question_type: "multiple_choice",
            order_index: i + 1,
          })
          .select()
          .single()

        if (questionError) throw questionError

        // Create options
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j]

          const { error: optionError } = await supabase.from("quiz_options").insert({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: j + 1,
          })

          if (optionError) throw optionError
        }
      }

      router.push(`/instructor/courses/${courseId}/lessons/${lessonId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson 1 Quiz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="No time limit"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shuffle">Shuffle Questions</Label>
              <p className="text-sm text-muted-foreground">Randomize question order for each attempt</p>
            </div>
            <Switch id="shuffle" checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRetry">Allow Retry</Label>
              <p className="text-sm text-muted-foreground">Let learners retake the quiz</p>
            </div>
            <Switch id="allowRetry" checked={allowRetry} onCheckedChange={setAllowRetry} />
          </div>

          {allowRetry && (
            <div className="space-y-2">
              <Label htmlFor="cooldown">Retry Cooldown (hours)</Label>
              <Input
                id="cooldown"
                type="number"
                min="0"
                value={retryCooldown}
                onChange={(e) => setRetryCooldown(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showExplanations">Show Explanations</Label>
              <p className="text-sm text-muted-foreground">Display explanations after quiz completion</p>
            </div>
            <Switch id="showExplanations" checked={showExplanations} onCheckedChange={setShowExplanations} />
          </div>
        </CardContent>
      </Card>

      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
              {questions.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                required
                value={question.question_text}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                placeholder="Enter your question..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                value={question.explanation || ""}
                onChange={(e) => updateQuestionExplanation(qIndex, e.target.value)}
                placeholder="Explain the correct answer..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">This will be shown to learners after they complete the quiz</p>
            </div>

            <div className="space-y-3">
              <Label>Answer Options *</Label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={option.is_correct ? "default" : "outline"}
                    size="icon"
                    className={option.is_correct ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => toggleCorrect(qIndex, oIndex)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Input
                    required
                    value={option.option_text}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  {question.options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-full bg-transparent">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
          {isLoading ? "Creating..." : "Create Quiz"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
