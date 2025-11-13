# Integration Guide

This guide provides step-by-step instructions for integrating the OCEM Auth System into your new or existing project.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Supabase project set up
- Basic knowledge of Next.js and React

## Step 1: Project Setup

### For New Projects

1. Create a new Next.js project:
```bash
npx create-next-app@latest your-project-name --typescript --tailwind --eslint --app
cd your-project-name
```

2. Copy the `auth-system` folder to your project root

### For Existing Projects

1. Copy the `auth-system` folder to your project root
2. Ensure you have the required dependencies installed (see Step 2)

## Step 2: Install Dependencies

Install all required dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod lucide-react
```

For TypeScript projects, also install:
```bash
npm install --save-dev @types/node
```

## Step 3: Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp auth-system/.env.example .env.local
```

2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Database Setup

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the `setup.sql` script:
```sql
-- Copy and paste the contents of auth-system/database/setup.sql
```

4. If migrating from another auth system, also run `migrations.sql`

## Step 5: Middleware Configuration

1. Copy or update your `middleware.ts` file in the project root:
```typescript
import { updateSession } from './auth-system/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Step 6: Layout Integration

Update your root layout to include the auth provider:

```typescript
// app/layout.tsx
import { AuthProvider } from './auth-system/components/auth-provider'
import { Toaster } from '@/components/ui/toaster' // Your toast component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 7: Update Import Paths

Update all import paths in the auth system files to match your project structure:

1. Update `@/` imports to point to your project structure
2. Ensure toast/notification imports point to your UI components
3. Update any custom hook imports

Example script to update paths:
```bash
# Replace @/components/ui with your actual path
find auth-system -name "*.tsx" -type f -exec sed -i 's|@/components/ui|@/your/ui/path|g' {} \;
```

## Step 8: Authentication Pages

Create your authentication routes:

```typescript
// app/auth/login/page.tsx
import LoginForm from '@/auth-system/components/login-form'

export default function LoginPage() {
  return <LoginForm />
}

// app/auth/signup/page.tsx
import SignupForm from '@/auth-system/components/signup-form'

export default function SignupPage() {
  return <SignupForm />
}

// app/auth/callback/route.ts
export { GET } from '@/auth-system/pages/auth/callback/route'
```

## Step 9: Protected Routes

Protect your pages using the provided components:

```typescript
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/auth-system/components/protected-route'
import DashboardContent from './dashboard-content'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

// For admin-only pages
export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  )
}
```

## Step 10: Using Auth in Components

```typescript
'use client'

import { useAuth } from '@/auth-system/components/auth-provider'

export function ProfileComponent() {
  const { user, profile, signOut } = useAuth()

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {profile?.first_name}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Step 11: Server-Side Usage

For server components and API routes:

```typescript
// app/api/protected/route.ts
import { requireAuth } from '@/auth-system/lib/auth'

export async function GET() {
  const { user } = await requireAuth()
  
  return Response.json({ user })
}

// Server component
import { getUser } from '@/auth-system/lib/auth'

export default async function ServerComponent() {
  const { user } = await getUser()
  
  return <div>Server-side user: {user?.email}</div>
}
```

## Step 12: Customization

### Styling
The auth components use Tailwind CSS. Customize by:
1. Modifying the component styles directly
2. Updating your Tailwind configuration
3. Adding custom CSS classes

### Validation
Update validation schemas in `auth-system/lib/auth-validation.ts`:
```typescript
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  // Add your custom fields
})
```

### Add Custom Fields
1. Update the database schema
2. Modify the signup form
3. Update the validation schema
4. Update TypeScript types

## Step 13: Testing

Test your integration:

1. Start your development server:
```bash
npm run dev
```

2. Visit `/auth/signup` to create a test account
3. Check email verification (if enabled)
4. Test login at `/auth/login`
5. Verify protected routes work
6. Test social login (if configured)

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify environment variables
   - Check Supabase project status
   - Ensure correct URL format

2. **Import path errors**
   - Update all `@/` imports to match your structure
   - Check component exports

3. **Toast/notification errors**
   - Implement the toast interface
   - Or remove toast calls from auth components

4. **Middleware not working**
   - Ensure middleware.ts is in the project root
   - Check the matcher configuration

5. **Database errors**
   - Run the setup.sql script
   - Check RLS policies
   - Verify table permissions

### Getting Help

1. Check the main README.md for detailed API documentation
2. Review the component source code for implementation details
3. Check Supabase documentation for auth-related issues
4. Ensure all dependencies are correctly installed

## Advanced Configuration

### Custom Redirect URLs
Update the auth provider configuration:
```typescript
const config = {
  redirectTo: '/dashboard', // After login
  signupRedirectTo: '/welcome', // After signup
  // ... other options
}
```

### Role-Based Access
Extend the role system by:
1. Adding roles to the database
2. Updating the profile type
3. Creating custom protection hooks

### Email Templates
Configure in Supabase dashboard:
1. Go to Authentication > Settings
2. Customize email templates
3. Update redirect URLs

## Migration from Other Auth Systems

If migrating from another auth system:
1. Export user data from your current system
2. Run the migration SQL script
3. Update user references in your database
4. Test the migration with a few accounts first

## Production Checklist

- [ ] Environment variables configured
- [ ] Database setup complete
- [ ] Email templates configured
- [ ] Social auth configured (if needed)
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Security policies reviewed
- [ ] Performance optimized
- [ ] Monitoring setup

This completes the integration guide. Your auth system should now be fully functional in your project!