/**
 * Simple test to verify Jest setup is working
 */

describe("Jest Setup", () => {
  it("should run tests", () => {
    expect(true).toBe(true)
  })

  it("should have access to test utilities", () => {
    expect(typeof expect).toBe("function")
    expect(typeof describe).toBe("function")
    expect(typeof it).toBe("function")
  })

  it("should handle basic math", () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
  })
})

