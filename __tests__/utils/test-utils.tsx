import React, { ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  full_name: "Test User",
  role: "learner" as const,
  ...overrides,
})

export const createMockCourse = (overrides = {}) => ({
  id: "course-123",
  title: "Test Course",
  description: "Test Description",
  instructor_id: "instructor-123",
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockLesson = (overrides = {}) => ({
  id: "lesson-123",
  course_id: "course-123",
  title: "Test Lesson",
  order_index: 1,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockQuiz = (overrides = {}) => ({
  id: "quiz-123",
  lesson_id: "lesson-123",
  title: "Test Quiz",
  passing_score: 70,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockQuizQuestion = (overrides = {}) => ({
  id: "question-123",
  quiz_id: "quiz-123",
  question_text: "Test Question",
  question_type: "multiple_choice" as const,
  order_index: 1,
  created_at: new Date().toISOString(),
  options: [
    {
      id: "option-1",
      option_text: "Option 1",
      is_correct: true,
      order_index: 1,
    },
    {
      id: "option-2",
      option_text: "Option 2",
      is_correct: false,
      order_index: 2,
    },
  ],
  ...overrides,
})

