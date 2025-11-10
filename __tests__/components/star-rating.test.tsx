import { render, screen } from "../utils/test-utils"
import { StarRating } from "@/components/star-rating"
import userEvent from "@testing-library/user-event"

describe("StarRating", () => {
  it("renders correct number of stars", () => {
    render(<StarRating rating={3} maxRating={5} />)
    const stars = screen.getAllByRole("button")
    expect(stars).toHaveLength(5)
  })

  it("displays correct rating visually", () => {
    render(<StarRating rating={4} maxRating={5} showValue />)
    expect(screen.getByText("4.0")).toBeInTheDocument()
  })

  it("allows rating change when interactive", async () => {
    const user = userEvent.setup()
    const onRatingChange = jest.fn()
    render(<StarRating rating={0} interactive onRatingChange={onRatingChange} />)

    const stars = screen.getAllByRole("button")
    await user.click(stars[2]) // Click 3rd star

    expect(onRatingChange).toHaveBeenCalledWith(3)
  })

  it("does not allow rating change when not interactive", async () => {
    const user = userEvent.setup()
    const onRatingChange = jest.fn()
    render(<StarRating rating={3} interactive={false} onRatingChange={onRatingChange} />)

    const stars = screen.getAllByRole("button")
    await user.click(stars[0])

    expect(onRatingChange).not.toHaveBeenCalled()
  })

  it("applies correct size classes", () => {
    const { container } = render(<StarRating rating={3} size="lg" />)
    const stars = container.querySelectorAll("svg")
    expect(stars[0]).toHaveClass("w-6", "h-6")
  })
})

