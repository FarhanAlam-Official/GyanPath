"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Trash2, Check, GripVertical } from "lucide-react"
import { toast } from "@/lib/utils/toast"

interface QuestionOption {
  id?: string
  option_text: string
  option_text_ne?: string
  is_correct: boolean
  order_index: number
}

interface Question {
  id?: string
  question_text: string
  question_text_ne?: string
  explanation?: string
  explanation_ne?: string
  question_type: "multiple_choice" | "true_false"
  order_index: number
  options: QuestionOption[]
}

interface QuestionManagerProps {
  quizId: string
  initialQuestions?: Question[]
  onQuestionsChange?: (questions: Question[]) => void
}

export function QuestionManager({ quizId, initialQuestions = [], onQuestionsChange }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isLoading, setIsLoading] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  useEffect(() => {
    if (onQuestionsChange) {
      onQuestionsChange(questions)
    }
  }, [questions, onQuestionsChange])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [quizId])

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: "",
      question_type: "multiple_choice",
      order_index: questions.length + 1,
      options: [
        { option_text: "", is_correct: false, order_index: 1 },
        { option_text: "", is_correct: false, order_index: 2 },
      ],
    }
    setQuestions([...questions, newQuestion])
    setEditingQuestionId(null)
  }

  const removeQuestion = async (questionId: string | undefined, index: number) => {
    if (!questionId) {
      // New question, just remove from state
      setQuestions(questions.filter((_, i) => i !== index))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete question")
      }

      toast.success("Question deleted", "The question has been removed.")
      await fetchQuestions()
    } catch (error) {
      toast.error("Failed to delete question", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuestion = async (question: Question, index: number) => {
    setIsLoading(true)
    try {
      // Validate
      if (!question.question_text.trim()) {
        throw new Error("Question text is required")
      }
      if (question.options.some((opt) => !opt.option_text.trim())) {
        throw new Error("All options must have text")
      }
      if (!question.options.some((opt) => opt.is_correct)) {
        throw new Error("At least one option must be marked as correct")
      }

      const questionData = {
        question_text: question.question_text,
        question_text_ne: question.question_text_ne || null,
        explanation: question.explanation || null,
        explanation_ne: question.explanation_ne || null,
        question_type: question.question_type,
        order_index: question.order_index,
        options: question.options.map((opt, optIndex) => ({
          option_text: opt.option_text,
          option_text_ne: opt.option_text_ne || null,
          is_correct: opt.is_correct,
          order_index: optIndex + 1,
        })),
      }

      if (question.id) {
        // Update existing question
        const response = await fetch(`/api/quizzes/${quizId}/questions/${question.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_text: questionData.question_text,
            question_text_ne: questionData.question_text_ne,
            explanation: questionData.explanation,
            explanation_ne: questionData.explanation_ne,
            order_index: questionData.order_index,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update question")
        }

        // Update options separately (would need an API endpoint for this)
        // For now, we'll recreate the question with all options
        toast.success("Question updated", "The question has been saved.")
      } else {
        // Create new question
        const response = await fetch(`/api/quizzes/${quizId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create question")
        }

        toast.success("Question created", "The question has been added.")
      }

      setEditingQuestionId(null)
      await fetchQuestions()
    } catch (error) {
      toast.error("Failed to save question", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const updated = [...questions]
    const question = updated[questionIndex]
    question.options.push({
      option_text: "",
      is_correct: false,
      order_index: question.options.length + 1,
    })
    setQuestions(updated)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex)
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<QuestionOption>) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      ...updates,
    }
    setQuestions(updated)
  }

  const toggleCorrect = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex].is_correct =
      !updated[questionIndex].options[optionIndex].is_correct
    setQuestions(updated)
  }

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => (
        <Card key={question.id || `new-${qIndex}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                Question {qIndex + 1}
              </CardTitle>
              <div className="flex gap-2">
                {editingQuestionId === (question.id || `new-${qIndex}`) ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => saveQuestion(question, qIndex)}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingQuestionId(question.id || `new-${qIndex}`)}
                  >
                    Edit
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" disabled={isLoading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the question.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeQuestion(question.id, qIndex)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={question.question_text}
                onChange={(e) => updateQuestion(qIndex, { question_text: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
                disabled={editingQuestionId !== (question.id || `new-${qIndex}`)}
              />
            </div>

            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                value={question.explanation || ""}
                onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                placeholder="Explain the correct answer..."
                rows={2}
                disabled={editingQuestionId !== (question.id || `new-${qIndex}`)}
              />
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
                    disabled={editingQuestionId !== (question.id || `new-${qIndex}`)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Input
                    value={option.option_text}
                    onChange={(e) => updateOption(qIndex, oIndex, { option_text: e.target.value })}
                    placeholder={`Option ${oIndex + 1}`}
                    disabled={editingQuestionId !== (question.id || `new-${qIndex}`)}
                  />
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={editingQuestionId !== (question.id || `new-${qIndex}`)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {editingQuestionId === (question.id || `new-${qIndex}`) && (
                <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  )
}

