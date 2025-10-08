"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Quiz, QuizQuestion, QuizOption, QuizAttempt } from "@/lib/types"

interface QuizTakerProps {
  quiz: Quiz
  questions: (QuizQuestion & { options: QuizOption[] })[]
  previousAttempts: QuizAttempt[]
  courseId: string
  lessonId: string
}

export function QuizTaker({ quiz, questions, previousAttempts, courseId, lessonId }: QuizTakerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const bestAttempt = previousAttempts.length > 0 ? previousAttempts[0] : null

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Calculate score
      let correctCount = 0
      const answerDetails: { questionId: string; selectedOptionId: string; isCorrect: boolean }[] = []

      for (const question of questions) {
        const selectedOptionId = answers[question.id]
        if (!selectedOptionId) continue

        const selectedOption = question.options.find((o) => o.id === selectedOptionId)
        const isCorrect = selectedOption?.is_correct || false

        if (isCorrect) correctCount++

        answerDetails.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
        })
      }

      const score = Math.round((correctCount / questions.length) * 100)
      const passed = score >= quiz.passing_score

      // Create attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quiz.id,
          user_id: user.id,
          score,
          total_questions: questions.length,
          passed,
        })
        .select()
        .single()

      if (attemptError) throw attemptError

      // Save answers
      for (const answer of answerDetails) {
        await supabase.from("quiz_answers").insert({
          attempt_id: attempt.id,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId,
          is_correct: answer.isCorrect,
        })
      }

      setResult({ score, passed })
    } catch (error) {
      console.error("[v0] Failed to submit quiz:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          {result.passed ? (
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          ) : (
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
          )}
          <h2 className="text-3xl font-bold mb-2">{result.passed ? "Congratulations!" : "Keep Trying!"}</h2>
          <p className="text-muted-foreground mb-6">
            You scored <span className="font-bold text-2xl text-[#7752FE]">{result.score}%</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Passing score: {quiz.passing_score}% • {result.passed ? "You passed!" : "Try again to pass"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/learner/courses/${courseId}/lessons/${lessonId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lesson
              </Link>
            </Button>
            {!result.passed && (
              <Button onClick={() => window.location.reload()} className="bg-[#7752FE] hover:bg-[#190482]">
                Retake Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/learner/courses/${courseId}/lessons/${lessonId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lesson
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-[#190482]">{quiz.title}</CardTitle>
            {quiz.description && <p className="text-muted-foreground mt-2">{quiz.description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold text-[#7752FE]">{questions.length}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Passing Score</p>
                <p className="text-2xl font-bold text-[#7752FE]">{quiz.passing_score}%</p>
              </div>
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Attempts</p>
                <p className="text-2xl font-bold text-[#7752FE]">{previousAttempts.length}</p>
              </div>
            </div>

            {bestAttempt && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">Best Score</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{bestAttempt.score}%</p>
                <p className="text-sm text-blue-700 mt-1">{bestAttempt.passed ? "Passed" : "Not passed"}</p>
              </div>
            )}

            <Button onClick={() => setIsStarted(true)} className="w-full bg-[#7752FE] hover:bg-[#190482]" size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {Object.keys(answers).length} / {questions.length} answered
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options
                .sort((a, b) => a.order_index - b.order_index)
                .map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
          Previous
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== questions.length}
            className="bg-[#7752FE] hover:bg-[#190482]"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-[#7752FE] hover:bg-[#190482]">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
