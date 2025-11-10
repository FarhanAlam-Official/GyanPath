import { render, screen, waitFor } from "../utils/test-utils"
import { CommentForm } from "@/components/comment-form"
import userEvent from "@testing-library/user-event"

// Mock fetch
global.fetch = jest.fn()

describe("CommentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ comment: { id: "comment-123" } }),
    })
  })

  it("renders comment form", () => {
    render(<CommentForm lessonId="lesson-123" />)

    expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /post comment/i })).toBeInTheDocument()
  })

  it("submits comment when form is filled", async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()

    render(<CommentForm lessonId="lesson-123" onSuccess={onSuccess} />)

    const textarea = screen.getByPlaceholderText(/add a comment/i)
    const submitButton = screen.getByRole("button", { name: /post comment/i })

    await user.type(textarea, "This is a test comment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: "lesson-123",
          content: "This is a test comment",
          parent_comment_id: null,
        }),
      })
    })
  })

  it("disables submit button when textarea is empty", () => {
    render(<CommentForm lessonId="lesson-123" />)

    const submitButton = screen.getByRole("button", { name: /post comment/i })
    expect(submitButton).toBeDisabled()
  })

  it("shows reply placeholder when replying", () => {
    render(<CommentForm lessonId="lesson-123" parentCommentId="comment-123" replyTo="John Doe" />)

    expect(screen.getByPlaceholderText(/reply to john doe/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reply/i })).toBeInTheDocument()
  })
})

