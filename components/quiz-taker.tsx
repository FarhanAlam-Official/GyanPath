"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Trophy, ArrowLeft, Clock, Eye, AlertCircle, WifiOff } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/offline/indexeddb"
import { toast } from "sonner"
import type { Quiz, QuizQuestion, QuizOption, QuizAttempt } from "@/lib/types"

interface QuizTakerProps {
  quiz: Quiz
  questions: (QuizQuestion & { options: QuizOption[] })[]
  previousAttempts: QuizAttempt[]
  courseId: string
  lessonId: string
}

interface AnswerDetail {
  questionId: string
  selectedOptionId: string
  isCorrect: boolean
  correctOptionId?: string
}

export function QuizTaker({ quiz, questions, previousAttempts, courseId, lessonId }: QuizTakerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    answerDetails: AnswerDetail[]
    attemptId: string
    timeTaken: number
  } | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isTimeUp, setIsTimeUp] = useState(false)

  // Shuffle questions if enabled
  const shuffledQuestions = useMemo(() => {
    if (quiz.shuffle_questions) {
      const shuffled = [...questions]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    return questions
  }, [questions, quiz.shuffle_questions])

  // Check retry cooldown
  const canRetry = useMemo(() => {
    if (!quiz.allow_retry) return false
    const latestAttempt = previousAttempts[0]
    if (!latestAttempt || !latestAttempt.can_retry_after) return true
    return new Date(latestAttempt.can_retry_after) <= new Date()
  }, [previousAttempts, quiz.allow_retry])

  const retryAfter = useMemo(() => {
    const latestAttempt = previousAttempts[0]
    if (!latestAttempt || !latestAttempt.can_retry_after) return null
    return new Date(latestAttempt.can_retry_after)
  }, [previousAttempts])

  // Time limit countdown
  useEffect(() => {
    if (!isStarted || !quiz.time_limit_minutes || timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          setIsTimeUp(true)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStarted, quiz.time_limit_minutes, timeRemaining])

  const handleStart = () => {
    setIsStarted(true)
    setStartTime(Date.now())
    if (quiz.time_limit_minutes) {
      setTimeRemaining(quiz.time_limit_minutes * 60)
    }
  }

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleAutoSubmit = async () => {
    if (isSubmitting) return
    await handleSubmit()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Calculate score and answer details
      let correctCount = 0
      const answerDetails: AnswerDetail[] = []

      for (const question of shuffledQuestions) {
        const selectedOptionId = answers[question.id]
        if (!selectedOptionId) continue

        const selectedOption = question.options.find((o) => o.id === selectedOptionId)
        const correctOption = question.options.find((o) => o.is_correct)
        const isCorrect = selectedOption?.is_correct || false

        if (isCorrect) correctCount++

        answerDetails.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
          correctOptionId: correctOption?.id,
        })
      }

      const score = Math.round((correctCount / shuffledQuestions.length) * 100)
      const passed = score >= quiz.passing_score
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

      // Check if offline
      const isOffline = !navigator.onLine

      if (isOffline) {
        // Queue quiz attempt for offline sync
        await db.addToQueue({
          type: "quiz_attempt",
          data: {
            quiz_id: quiz.id,
            user_id: user.id,
            score,
            total_questions: shuffledQuestions.length,
            passed,
            time_taken_seconds: timeTaken,
            started_at: startTime ? new Date(startTime).toISOString() : null,
            answers: answerDetails.map((a) => ({
              question_id: a.questionId,
              selected_option_id: a.selectedOptionId,
              is_correct: a.isCorrect,
            })),
          },
        })

        // Show result locally (will sync when online)
        setResult({
          score,
          passed,
          answerDetails,
          attemptId: "offline-pending",
          timeTaken,
        })

        toast.success("Quiz submitted offline", "Your results will sync when you're back online")
      } else {
        // Calculate retry cooldown
        const cooldownHours = quiz.retry_cooldown_hours || 24
        const canRetryAfter = quiz.allow_retry
          ? new Date(Date.now() + cooldownHours * 60 * 60 * 1000).toISOString()
          : null

        // Create attempt
        const { data: attempt, error: attemptError } = await supabase
          .from("quiz_attempts")
          .insert({
            quiz_id: quiz.id,
            user_id: user.id,
            score,
            total_questions: shuffledQuestions.length,
            passed,
            time_taken_seconds: timeTaken,
            started_at: startTime ? new Date(startTime).toISOString() : null,
            can_retry_after: canRetryAfter,
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

        setResult({
          score,
          passed,
          answerDetails,
          attemptId: attempt.id,
          timeTaken,
        })
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error)
      toast.error("Failed to submit quiz", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]
  const bestAttempt = previousAttempts.length > 0 ? previousAttempts[0] : null

  // Review mode - show all questions with answers
  if (showReview && result) {
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
            <CardTitle className="text-2xl">Quiz Review</CardTitle>
            <p className="text-muted-foreground">
              Review your answers and explanations for each question
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {shuffledQuestions.map((question, index) => {
              const answerDetail = result.answerDetails.find((a) => a.questionId === question.id)
              const selectedOption = question.options.find((o) => o.id === answerDetail?.selectedOptionId)
              const correctOption = question.options.find((o) => o.is_correct)
              const isCorrect = answerDetail?.isCorrect || false

              return (
                <Card key={question.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        Question {index + 1}: {question.question_text}
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Your Answer:</p>
                      <div
                        className={`p-3 rounded-lg ${
                          isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <p className={isCorrect ? "text-green-900" : "text-red-900"}>
                          {selectedOption?.option_text || "No answer provided"}
                        </p>
                      </div>
                    </div>

                    {!isCorrect && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-green-700">Correct Answer:</p>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <p className="text-green-900">{correctOption?.option_text}</p>
                        </div>
                      </div>
                    )}

                    {quiz.show_explanations && question.explanation && (
                      <Alert className={isCorrect ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Explanation:</strong> {question.explanation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            <div className="flex gap-4 justify-center pt-4">
              <Button asChild variant="outline">
                <Link href={`/learner/courses/${courseId}/lessons/${lessonId}`}>
                  Back to Lesson
                </Link>
              </Button>
              {canRetry && quiz.allow_retry && (
                <Button onClick={() => window.location.reload()} className="bg-[#7752FE] hover:bg-[#190482]">
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (result && !showReview) {
    const wrongAnswers = result.answerDetails.filter((a) => !a.isCorrect).length

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
          <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-2xl font-bold text-green-600">{result.answerDetails.filter((a) => a.isCorrect).length}</p>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">{wrongAnswers}</p>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold text-[#7752FE]">{formatTime(result.timeTaken)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Passing score: {quiz.passing_score}% • {result.passed ? "You passed!" : "Try again to pass"}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild variant="outline">
              <Link href={`/learner/courses/${courseId}/lessons/${lessonId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lesson
              </Link>
            </Button>
            {quiz.show_explanations && (
              <Button onClick={() => setShowReview(true)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
            )}
            {canRetry && quiz.allow_retry && (
              <Button onClick={() => window.location.reload()} className="bg-[#7752FE] hover:bg-[#190482]">
                Retake Quiz
              </Button>
            )}
            {!canRetry && retryAfter && (
              <Button disabled variant="outline">
                Retry available in {Math.ceil((retryAfter.getTime() - Date.now()) / (1000 * 60 * 60))} hours
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pre-start screen
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

            {quiz.time_limit_minutes && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This quiz has a time limit of <strong>{quiz.time_limit_minutes} minutes</strong>. Make sure you're ready
                  before starting.
                </AlertDescription>
              </Alert>
            )}

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

            {!canRetry && retryAfter && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can retry this quiz after {retryAfter.toLocaleString()}. Please wait for the cooldown period.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleStart}
              disabled={!canRetry && !result}
              className="w-full bg-[#7752FE] hover:bg-[#190482]"
              size="lg"
            >
              {!canRetry && retryAfter ? "Retry Not Available" : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz in progress
  return (
    <div className="space-y-6">
      {/* Time limit indicator */}
      {quiz.time_limit_minutes && timeRemaining !== null && (
        <Alert className={timeRemaining < 60 ? "border-red-500 bg-red-50" : ""}>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>Time remaining:</span>
            <span className={`font-bold ${timeRemaining < 60 ? "text-red-600" : "text-[#7752FE]"}`}>
              {formatTime(timeRemaining)}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {Object.keys(answers).length} / {shuffledQuestions.length} answered
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

        {currentQuestionIndex === shuffledQuestions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== shuffledQuestions.length || isTimeUp}
            className="bg-[#7752FE] hover:bg-[#190482]"
          >
            {isSubmitting ? "Submitting..." : isTimeUp ? "Time's Up!" : "Submit Quiz"}
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
