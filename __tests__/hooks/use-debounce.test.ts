import { renderHook, waitFor } from "@testing-library/react"
import { useDebounce } from "@/hooks/use-debounce"
import { useState } from "react"

// Test the debounce hook
describe("useDebounce", () => {
  it("debounces value changes", async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "test", delay: 300 },
    })

    expect(result.current).toBe("test")

    rerender({ value: "test1", delay: 300 })
    rerender({ value: "test2", delay: 300 })
    rerender({ value: "test3", delay: 300 })

    // Value should still be "test" immediately
    expect(result.current).toBe("test")

    // After delay, should be "test3"
    await waitFor(
      () => {
        expect(result.current).toBe("test3")
      },
      { timeout: 500 },
    )
  })

  it("uses default delay of 500ms", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    })

    expect(result.current).toBe("initial")

    rerender({ value: "updated" })

    await waitFor(
      () => {
        expect(result.current).toBe("updated")
      },
      { timeout: 600 },
    )
  })
})

