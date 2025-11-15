# Testing Guide

## Overview

This document describes the testing strategy and setup for GyanPath. We use Jest and React Testing Library for unit and component tests.

## Test Structure

```
__tests__/
├── api/              # API route tests
├── components/       # Component tests
├── hooks/           # Hook tests
├── integration/     # Integration tests
└── utils/           # Test utilities and mocks
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Test Types

### 1. Unit Tests

Unit tests test individual functions, utilities, and hooks in isolation.

**Example:**
```typescript
// __tests__/utils/validation.test.ts
import { emailSchema } from "@/lib/utils/validation"

describe("emailSchema", () => {
  it("validates correct email", () => {
    expect(() => emailSchema.parse("test@example.com")).not.toThrow()
  })
})
```

### 2. Component Tests

Component tests test React components using React Testing Library.

**Example:**
```typescript
// __tests__/components/star-rating.test.tsx
import { render, screen } from "../utils/test-utils"
import { StarRating } from "@/components/star-rating"

describe("StarRating", () => {
  it("renders correct number of stars", () => {
    render(<StarRating rating={3} maxRating={5} />)
    const stars = screen.getAllByRole("button")
    expect(stars).toHaveLength(5)
  })
})
```

### 3. API Route Tests

API route tests test Next.js API routes.

**Example:**
```typescript
// __tests__/api/comments.test.ts
import { GET, POST } from "@/app/api/comments/route"

describe("Comments API", () => {
  it("returns comments for a lesson", async () => {
    const request = new NextRequest("http://localhost:3000/api/comments?lesson_id=123")
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### 4. Integration Tests

Integration tests test multiple components working together.

**Example:**
```typescript
// __tests__/integration/course-enrollment.test.tsx
describe("Course Enrollment Flow", () => {
  it("allows user to browse and enroll in a course", async () => {
    // Test complete enrollment flow
  })
})
```

## Test Utilities

### Test Utils (`__tests__/utils/test-utils.tsx`)

Provides custom render function with all providers (QueryClient, Theme, etc.)

```typescript
import { render, screen } from "../utils/test-utils"

// Mock data factories
import { createMockUser, createMockCourse } from "../utils/test-utils"
```

### Mock Supabase (`__tests__/utils/mock-supabase.ts`)

Provides mocked Supabase client for testing

```typescript
import { createMockSupabaseClient } from "../utils/mock-supabase"

const mockSupabase = createMockSupabaseClient()
```

## Writing Tests

### Component Tests

1. **Import test utilities:**
```typescript
import { render, screen } from "../utils/test-utils"
import userEvent from "@testing-library/user-event"
```

2. **Render component:**
```typescript
render(<YourComponent prop1="value" />)
```

3. **Query elements:**
```typescript
// By role (preferred)
const button = screen.getByRole("button", { name: /submit/i })

// By text
const heading = screen.getByText("Hello World")

// By test id (last resort)
const element = screen.getByTestId("custom-element")
```

4. **Interact with elements:**
```typescript
const user = userEvent.setup()
await user.click(button)
await user.type(input, "text")
```

5. **Assert results:**
```typescript
expect(button).toBeInTheDocument()
expect(screen.getByText("Success")).toBeInTheDocument()
```

### API Route Tests

1. **Mock Supabase:**
```typescript
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))
```

2. **Create request:**
```typescript
const request = new NextRequest("http://localhost:3000/api/endpoint", {
  method: "POST",
  body: JSON.stringify({ data: "value" }),
})
```

3. **Call route handler:**
```typescript
const response = await POST(request, { params: Promise.resolve({ id: "123" }) })
const data = await response.json()
```

4. **Assert response:**
```typescript
expect(response.status).toBe(200)
expect(data).toHaveProperty("key")
```

## Test Coverage Goals

- **Critical Paths**: 90%+ coverage
  - Authentication
  - Course enrollment
  - Quiz submission
  - Progress tracking
  - Certificate generation

- **Components**: 80%+ coverage
  - Form components
  - Interactive components
  - Data display components

- **Utilities**: 100% coverage
  - Validation functions
  - Formatting functions
  - Helper functions

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the user sees and does
   - Avoid testing implementation details

2. **Use Semantic Queries**
   - Prefer `getByRole` over `getByTestId`
   - Use accessible queries

3. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach` to set up common state

4. **Mock External Dependencies**
   - Mock API calls
   - Mock Supabase client
   - Mock Next.js router

5. **Test Error Cases**
   - Test validation errors
   - Test network errors
   - Test edge cases

6. **Use Descriptive Test Names**
   - Use "should" or "it" format
   - Be specific about what is being tested

## Continuous Integration

Tests run automatically on:
- Pull requests
- Before merging to main
- On deployment

## Debugging Tests

### Run Single Test File
```bash
npm test -- path/to/test.file.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="StarRating"
```

### Debug in VS Code
1. Set breakpoint in test
2. Open "Run and Debug"
3. Select "Jest: Current File"
4. Start debugging

## Common Issues

### "Cannot find module" errors
- Make sure paths in `jest.config.js` match `tsconfig.json`
- Check that `moduleNameMapper` is configured correctly

### "act" warnings
- Use `waitFor` for async updates
- Use `findBy*` queries for elements that appear asynchronously

### Mock not working
- Check that mock is defined before the module is imported
- Use `jest.resetModules()` if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

