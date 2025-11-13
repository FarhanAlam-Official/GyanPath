# GyanPath - Technical Recommendations & Best Practices

## 1. ARCHITECTURE IMPROVEMENTS

### 1.1 API Layer Restructuring

#### Current State

- API routes scattered across `/app/api/`
- Limited error handling
- No request/response validation middleware
- No API versioning

#### Recommended Changes

**1. Create API Middleware Stack**

```typescript
// lib/api/middleware.ts
export const apiMiddleware = {
  // Authentication middleware
  requireAuth: async (req: NextRequest) => {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UnauthorizedError()
    return user
  },

  // Role-based access control
  requireRole: (roles: UserRole[]) => async (req: NextRequest) => {
    const user = await apiMiddleware.requireAuth(req)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !roles.includes(profile.role)) {
      throw new ForbiddenError()
    }
    return { user, profile }
  },

  // Request validation
  validateBody: (schema: ZodSchema) => (body: unknown) => {
    return schema.parse(body)
  },

  // Error handling
  handleError: (error: unknown) => {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**2. Create API Route Handlers**

```typescript
// lib/api/handlers.ts
export const createApiHandler = (
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options?: {
    auth?: boolean
    roles?: UserRole[]
    validate?: ZodSchema
    rateLimit?: boolean
  }
) => {
  return async (req: NextRequest, context: any) => {
    try {
      // Apply middleware
      if (options?.auth) {
        await apiMiddleware.requireAuth(req)
      }
      if (options?.roles) {
        await apiMiddleware.requireRole(options.roles)(req)
      }
      if (options?.validate && req.method !== 'GET') {
        const body = await req.json()
        options.validate.parse(body)
      }
      if (options?.rateLimit) {
        // Apply rate limiting
      }

      return await handler(req, context)
    } catch (error) {
      return apiMiddleware.handleError(error)
    }
  }
}
```

**3. Implement API Versioning**

```
/app/api/v1/
├── courses/
├── lessons/
├── quizzes/
├── users/
└── admin/

/app/api/v2/
├── courses/
├── lessons/
└── ...
```

### 1.2 Database Layer Improvements

#### 1. Create Data Access Layer (DAL)

```typescript
// lib/dal/courses.ts
export const courseDAL = {
  async create(data: CreateCourseInput, userId: string) {
    const supabase = await createServerClient()
    return supabase
      .from('courses')
      .insert({
        ...data,
        instructor_id: userId
      })
      .select()
      .single()
  },

  async update(id: string, data: UpdateCourseInput) {
    const supabase = await createServerClient()
    return supabase
      .from('courses')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async getById(id: string) {
    const supabase = await createServerClient()
    return supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(id, full_name, email),
        lessons:lessons(count),
        enrollments:course_enrollments(count)
      `)
      .eq('id', id)
      .single()
  },

  async listByInstructor(instructorId: string) {
    const supabase = await createServerClient()
    return supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
  }
}
```

#### 2. Implement Query Optimization

```typescript
// lib/dal/queries.ts
export const optimizedQueries = {
  // Use select() to limit columns
  getCourseBasic: (id: string) => 
    supabase
      .from('courses')
      .select('id, title, thumbnail_url, instructor_id')
      .eq('id', id),

  // Use pagination
  listCoursesPaginated: (page: number, limit: number) =>
    supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1),

  // Use batch queries
  getMultipleCourses: (ids: string[]) =>
    supabase
      .from('courses')
      .select('*')
      .in('id', ids),

  // Use aggregations
  getCourseStats: (courseId: string) =>
    supabase
      .from('course_enrollments')
      .select('count')
      .eq('course_id', courseId)
}
```

### 1.3 State Management Improvements

#### 1. Create Custom Hooks for Data Fetching

```typescript
// hooks/use-course.ts
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`)
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/courses?${params}`)
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCourseInput) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}
```

#### 2. Implement Optimistic Updates

```typescript
export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateCourseInput) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onMutate: async (newData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['course', courseId] })

      // Snapshot previous data
      const previousData = queryClient.getQueryData(['course', courseId])

      // Update cache optimistically
      queryClient.setQueryData(['course', courseId], (old: any) => ({
        ...old,
        ...newData
      }))

      return { previousData }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['course', courseId], context.previousData)
      }
    }
  })
}
```

---

## 2. PERFORMANCE OPTIMIZATIONS

### 2.1 Image Optimization

#### Current Implementation

```typescript
// ✅ Already using Next.js Image component
import Image from 'next/image'

<Image
  src={course.thumbnail_url}
  alt={course.title}
  width={400}
  height={300}
  priority={false}
/>
```

#### Recommended Enhancements

```typescript
// Add image optimization on upload
export const optimizeImage = async (file: File) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  return new Promise((resolve) => {
    img.onload = () => {
      // Resize to max 1920x1080
      const maxWidth = 1920
      const maxHeight = 1080
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/webp' }))
      }, 'image/webp', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}
```

### 2.2 Video Optimization

#### Implement Video Transcoding

```typescript
// lib/video/transcoding.ts
export const transcodeVideo = async (
  file: File,
  qualities: ('360p' | '480p' | '720p' | '1080p')[] = ['360p', '720p']
) => {
  // Use FFmpeg.wasm or send to backend service
  // Generate multiple quality versions
  // Return URLs for each quality
}

// API endpoint
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(`${Date.now()}-${file.name}`, file)

  if (error) throw error

  // Queue transcoding job
  await queueTranscodingJob(data.path)

  return NextResponse.json({ path: data.path })
}
```

### 2.3 Database Query Optimization

#### Add Query Monitoring

```typescript
// lib/utils/query-monitor.ts
export const monitorQuery = async (
  name: string,
  query: Promise<any>
) => {
  const start = performance.now()
  try {
    const result = await query
    const duration = performance.now() - start
    
    if (duration > 1000) {
      console.warn(`Slow query: ${name} took ${duration}ms`)
      // Send to monitoring service
    }
    
    return result
  } catch (error) {
    console.error(`Query failed: ${name}`, error)
    throw error
  }
}
```

#### Implement Connection Pooling

```typescript
// Use Supabase connection pooling
// Already configured in Supabase dashboard
// Ensure max_connections is set appropriately
```

### 2.4 Caching Strategy

#### Implement Multi-Layer Caching

```typescript
// lib/cache/strategy.ts
export const cacheStrategy = {
  // Browser cache (Service Worker)
  browser: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    strategies: ['cache-first', 'network-first', 'stale-while-revalidate']
  },

  // API response cache (in-memory)
  api: {
    ttl: 5 * 60 * 1000, // 5 minutes
    keys: ['courses', 'lessons', 'recommendations']
  },

  // Database query cache (Redis)
  database: {
    ttl: 10 * 60 * 1000, // 10 minutes
    keys: ['user-progress', 'course-stats']
  },

  // CDN cache
  cdn: {
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    headers: {
      'Cache-Control': 'public, max-age=2592000, immutable'
    }
  }
}
```

---

## 3. SECURITY ENHANCEMENTS

### 3.1 Input Validation & Sanitization

#### Enhance Validation

```typescript
// lib/validation/schemas.ts
export const courseSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  category: z.enum(['programming', 'design', 'business', 'other']),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration_hours: z.number()
    .min(0.5)
    .max(1000)
    .optional()
})

// Sanitize HTML
export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  })
}
```

### 3.2 Authentication & Authorization

#### Implement Session Management

```typescript
// lib/auth/session.ts
export const sessionManager = {
  async createSession(userId: string) {
    const token = generateSecureToken()
    await redis.setex(
      `session:${token}`,
      24 * 60 * 60, // 24 hours
      userId
    )
    return token
  },

  async validateSession(token: string) {
    const userId = await redis.get(`session:${token}`)
    if (!userId) throw new UnauthorizedError()
    return userId
  },

  async revokeSession(token: string) {
    await redis.del(`session:${token}`)
  }
}
```

#### Implement CSRF Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Generate CSRF token
  const csrfToken = generateToken()
  
  const response = NextResponse.next()
  response.cookies.set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  return response
}
```

### 3.3 API Security

#### Implement Request Signing

```typescript
// lib/api/signing.ts
export const signRequest = (
  method: string,
  path: string,
  body?: any,
  secret: string = process.env.API_SECRET!
) => {
  const timestamp = Date.now()
  const payload = `${method}${path}${timestamp}${body ? JSON.stringify(body) : ''}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp.toString()
  }
}

// Verify in middleware
export const verifySignature = (
  req: NextRequest,
  secret: string = process.env.API_SECRET!
) => {
  const signature = req.headers.get('X-Signature')
  const timestamp = req.headers.get('X-Timestamp')

  if (!signature || !timestamp) throw new UnauthorizedError()

  // Verify timestamp is recent (within 5 minutes)
  if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
    throw new UnauthorizedError('Request expired')
  }

  // Verify signature
  // ... implementation
}
```

### 3.4 Data Protection

#### Implement Encryption

```typescript
// lib/crypto/encryption.ts
export const encrypt = (data: string, key: string) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export const decrypt = (encrypted: string, key: string) => {
  const [iv, authTag, data] = encrypted.split(':')
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key),
    Buffer.from(iv, 'hex')
  )
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

---

## 4. TESTING IMPROVEMENTS

### 4.1 Unit Testing

#### Test Utilities

```typescript
// __tests__/utils/test-utils.tsx
export const renderWithProviders = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>,
    options
  )
}

export const createMockCourse = (overrides?: Partial<Course>): Course => ({
  id: 'test-course-1',
  title: 'Test Course',
  description: 'Test Description',
  instructor_id: 'test-instructor',
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})
```

### 4.2 Integration Testing

#### API Testing

```typescript
// __tests__/api/courses.test.ts
describe('Courses API', () => {
  it('should create a course', async () => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Course',
        description: 'Test'
      })
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBeDefined()
  })

  it('should require authentication', async () => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify({})
    })

    expect(response.status).toBe(401)
  })
})
```

### 4.3 E2E Testing

#### Playwright Setup

```typescript
// e2e/courses.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Course Management', () => {
  test('instructor can create a course', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'instructor@test.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Navigate to course creation
    await page.goto('/instructor/courses')
    await page.click('button:has-text("Create Course")')

    // Fill form
    await page.fill('[name="title"]', 'New Course')
    await page.fill('[name="description"]', 'Course description')
    await page.click('button:has-text("Create")')

    // Verify
    await expect(page).toHaveURL(/\/instructor\/courses\//)
  })
})
```

---

## 5. MONITORING & OBSERVABILITY

### 5.1 Error Tracking

#### Sentry Integration

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### 5.2 Performance Monitoring

#### Web Vitals

```typescript
// lib/monitoring/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export const reportWebVitals = (metric: any) => {
  // Send to analytics service
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric)
  })
}

getCLS(reportWebVitals)
getFID(reportWebVitals)
getFCP(reportWebVitals)
getLCP(reportWebVitals)
getTTFB(reportWebVitals)
```

### 5.3 Logging

#### Structured Logging

```typescript
// lib/logging/logger.ts
export const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  },

  error: (message: string, error?: Error, context?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...context
    }))
  },

  warn: (message: string, context?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  }
}
```

---

## 6. DEPLOYMENT & INFRASTRUCTURE

### 6.1 Environment Configuration

#### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=

# API Configuration
API_SECRET=
API_RATE_LIMIT_WINDOW=60000
API_RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Redis (for production)
REDIS_URL=

# Payment (optional)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

### 6.2 Docker Configuration

#### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

### 6.3 CI/CD Pipeline

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 7. DOCUMENTATION

### 7.1 API Documentation

#### OpenAPI/Swagger

```typescript
// lib/api/openapi.ts
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GyanPath API',
    version: '1.0.0'
  },
  paths: {
    '/api/courses': {
      get: {
        summary: 'List courses',
        responses: {
          '200': {
            description: 'List of courses'
          }
        }
      },
      post: {
        summary: 'Create course',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: courseSchema
            }
          }
        }
      }
    }
  }
}
```

### 7.2 Component Documentation

#### Storybook

```typescript
// components/CourseCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { CourseCard } from './CourseCard'

const meta: Meta<typeof CourseCard> = {
  component: CourseCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    course: {
      id: '1',
      title: 'React Basics',
      description: 'Learn React fundamentals',
      thumbnail_url: '/placeholder.jpg',
      instructor_id: 'instructor-1',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}
```

---

## 8. BEST PRACTICES CHECKLIST

### Code Quality

- [ ] Use TypeScript strict mode
- [ ] Follow ESLint rules
- [ ] Format with Prettier
- [ ] Write meaningful variable names
- [ ] Add JSDoc comments for complex functions
- [ ] Keep functions small and focused
- [ ] Use composition over inheritance
- [ ] Avoid prop drilling (use context/hooks)

### Performance

- [ ] Lazy load components
- [ ] Memoize expensive computations
- [ ] Use React.memo for pure components
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Use code splitting
- [ ] Implement pagination
- [ ] Cache API responses

### Security

- [ ] Validate all inputs
- [ ] Sanitize HTML
- [ ] Use HTTPS
- [ ] Implement CSRF protection
- [ ] Use secure cookies
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Regular security audits

### Testing

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Aim for 80%+ coverage
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test accessibility
- [ ] Test performance

### Accessibility

- [ ] Use semantic HTML
- [ ] Add alt text to images
- [ ] Use ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Maintain color contrast
- [ ] Support dark mode
- [ ] Test with accessibility tools

### Documentation

- [ ] Document API endpoints
- [ ] Document components
- [ ] Document database schema
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Keep README updated
- [ ] Add code comments
- [ ] Create architecture diagrams

---

**Document Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Implementation
