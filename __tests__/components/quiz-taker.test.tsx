import { render, screen, waitFor } from "../utils/test-utils"
import { QuizTaker } from "@/components/quiz-taker"
import { createMockQuiz, createMockQuizQuestion } from "../utils/test-utils"
import userEvent from "@testing-library/user-event"

// Mock the supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({
        data: { id: "attempt-123" },
        error: null,
      }),
    })),
  })),
}))

describe("QuizTaker", () => {
  const mockQuiz = createMockQuiz({
    id: "quiz-123",
    title: "Test Quiz",
    passing_score: 70,
  })

  const mockQuestions = [
    createMockQuizQuestion({
      id: "q1",
      question_text: "What is 2+2?",
      options: [
        {
          id: "o1",
          option_text: "3",
          is_correct: false,
          order_index: 1,
        },
        {
          id: "o2",
          option_text: "4",
          is_correct: true,
          order_index: 2,
        },
        {
          id: "o3",
          option_text: "5",
          is_correct: false,
          order_index: 3,
        },
      ],
    }),
    createMockQuizQuestion({
      id: "q2",
      question_text: "What is the capital of Nepal?",
      options: [
        {
          id: "o4",
          option_text: "Pokhara",
          is_correct: false,
          order_index: 1,
        },
        {
          id: "o5",
          option_text: "Kathmandu",
          is_correct: true,
          order_index: 2,
        },
      ],
    }),
  ]

  it("renders quiz start screen", () => {
    render(
      <QuizTaker
        quiz={mockQuiz}
        questions={mockQuestions}
        previousAttempts={[]}
        courseId="course-123"
        lessonId="lesson-123"
      />,
    )

    expect(screen.getByText("Test Quiz")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument() // Number of questions
    expect(screen.getByText("70%")).toBeInTheDocument() // Passing score
    expect(screen.getByText("Start Quiz")).toBeInTheDocument()
  })

  it("shows quiz questions when started", async () => {
    const user = userEvent.setup()
    render(
      <QuizTaker
        quiz={mockQuiz}
        questions={mockQuestions}
        previousAttempts={[]}
        courseId="course-123"
        lessonId="lesson-123"
      />,
    )

    const startButton = screen.getByText("Start Quiz")
    await user.click(startButton)

    expect(screen.getByText("What is 2+2?")).toBeInTheDocument()
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument()
  })

  it("allows navigation between questions", async () => {
    const user = userEvent.setup()
    render(
      <QuizTaker
        quiz={mockQuiz}
        questions={mockQuestions}
        previousAttempts={[]}
        courseId="course-123"
        lessonId="lesson-123"
      />,
    )

    await user.click(screen.getByText("Start Quiz"))
    await user.click(screen.getByLabelText("4"))
    await user.click(screen.getByText("Next"))

    expect(screen.getByText("What is the capital of Nepal?")).toBeInTheDocument()
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument()
  })

  it("shows time limit warning when time limit is set", async () => {
    const user = userEvent.setup()
    const quizWithTimeLimit = createMockQuiz({
      ...mockQuiz,
      time_limit_minutes: 10,
    })

    render(
      <QuizTaker
        quiz={quizWithTimeLimit}
        questions={mockQuestions}
        previousAttempts={[]}
        courseId="course-123"
        lessonId="lesson-123"
      />,
    )

    expect(screen.getByText(/time limit of 10 minutes/)).toBeInTheDocument()
  })
})

