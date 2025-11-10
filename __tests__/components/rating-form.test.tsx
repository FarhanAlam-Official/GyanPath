import { render, screen, waitFor } from "../utils/test-utils"
import { RatingForm } from "@/components/rating-form"
import userEvent from "@testing-library/user-event"

global.fetch = jest.fn()

describe("RatingForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ rating: { id: "rating-123", rating: 5 } }),
    })
  })

  it("renders rating form", () => {
    render(<RatingForm courseId="course-123" />)

    expect(screen.getByText(/rate this course/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit rating/i })).toBeInTheDocument()
  })

  it("allows selecting rating", async () => {
    const user = userEvent.setup()
    render(<RatingForm courseId="course-123" />)

    // Click on 5th star
    const stars = screen.getAllByRole("button")
    await user.click(stars[4]) // 5th star (index 4)

    expect(screen.getByText("5.0")).toBeInTheDocument()
  })

  it("disables submit when no rating selected", () => {
    render(<RatingForm courseId="course-123" />)

    const submitButton = screen.getByRole("button", { name: /submit rating/i })
    expect(submitButton).toBeDisabled()
  })

  it("submits rating when form is filled", async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()

    render(<RatingForm courseId="course-123" onSuccess={onSuccess} />)

    // Select rating
    const stars = screen.getAllByRole("button")
    await user.click(stars[4]) // 5th star

    // Type review
    const reviewTextarea = screen.getByPlaceholderText(/share your thoughts/i)
    await user.type(reviewTextarea, "Great course!")

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit rating/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/courses/course-123/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 5,
          review: "Great course!",
        }),
      })
    })
  })

  it("shows update form when existing rating is provided", () => {
    const existingRating = {
      id: "rating-123",
      course_id: "course-123",
      user_id: "user-123",
      rating: 4,
      review: "Previous review",
      is_helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    render(<RatingForm courseId="course-123" existingRating={existingRating} />)

    expect(screen.getByText(/update your rating/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue("Previous review")).toBeInTheDocument()
  })
})

