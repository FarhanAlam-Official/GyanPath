# 🔐 Reusable Authentication System

A comprehensive, production-ready authentication system built with **Next.js**, **Supabase**, and **TypeScript**. This system provides a complete auth solution that can be easily integrated into any React/Next.js project.

## ✨ Features

### 🔑 **Core Authentication**
- **Email/Password Authentication** - Secure login and registration
- **Social Login** - Google and GitHub OAuth integration
- **Email Verification** - Required email confirmation for new accounts
- **Password Reset** - Secure password recovery flow
- **Session Management** - Persistent sessions with "Remember Me" option

### 🛡️ **Security & Protection**
- **Rate Limiting** - Protection against brute force attacks
- **Row Level Security** - Database-level access control
- **Role-based Access Control** - Admin, Moderator, and Viewer roles
- **Protected Routes** - Client and server-side route protection
- **Middleware Integration** - Automatic authentication checks

### 🎨 **User Experience**
- **Responsive Design** - Mobile-first, dark mode support
- **Loading States** - Comprehensive loading and error states
- **Form Validation** - Real-time validation with Zod schemas
- **Password Strength** - Real-time password strength indication
- **Notifications** - User-friendly success/error messages

### ⚙️ **Developer Experience**
- **TypeScript First** - Fully typed with comprehensive interfaces
- **Modular Components** - Easy to customize and extend
- **Server Actions** - Next.js 13+ App Router compatible
- **Comprehensive Documentation** - Detailed setup and usage guides
- **Database Migrations** - SQL scripts for easy setup

## 🏗️ Architecture

```
auth-system/
├── components/           # React components
│   ├── auth-provider.tsx    # Authentication context
│   ├── login-form.tsx      # Login form component
│   ├── signup-form.tsx     # Registration form
│   ├── protected-route.tsx # Route protection wrapper
│   ├── auth-layout.tsx     # Auth page layout
│   └── auth-skeleton.tsx   # Loading skeleton
├── lib/                  # Utility libraries
│   ├── auth.ts            # Server-side auth helpers
│   ├── auth-validation.ts # Form validation schemas
│   ├── notifications.ts   # Notification utilities
│   └── supabase/         # Supabase configuration
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Auth middleware
├── pages/                # Page components
│   ├── login.tsx         # Login page
│   ├── signup.tsx        # Registration page
│   └── callback.tsx      # OAuth callback
├── database/             # Database setup
│   ├── setup.sql         # Initial schema
│   └── migrations.sql    # Schema migrations
├── types/                # TypeScript definitions
│   └── index.ts          # Auth type definitions
├── docs/                 # Documentation
├── middleware.ts         # Next.js middleware
├── package.json          # Dependencies
└── .env.example          # Environment template
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Next.js 14+
- A Supabase project
- React 18+

### 1. **Supabase Setup**

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database setup script in your Supabase SQL Editor:
   ```sql
   -- Copy and run the contents of database/setup.sql
   ```
3. Configure authentication providers in your Supabase dashboard (optional)

### 2. **Installation**

Copy the auth-system folder to your Next.js project:

```bash
# Copy the entire auth-system folder to your project
cp -r auth-system ./src/
```

### 3. **Environment Configuration**

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp auth-system/.env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. **Install Dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react # for icons
```

### 5. **Setup Middleware**

Copy the middleware configuration to your project root:

```typescript
// middleware.ts
import type { NextRequest } from "next/server"
import { updateSession } from "./src/auth-system/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request, {
    protectedPaths: ["/dashboard", "/profile"],
    adminPaths: ["/admin"],
    moderatorPaths: ["/moderator"],
    loginPath: "/auth/login",
    homePath: "/"
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
```

### 6. **Wrap Your App**

Wrap your app with the AuthProvider:

```typescript
// app/layout.tsx
import { AuthProvider } from "@/auth-system/components/auth-provider"

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
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 📚 Usage Examples

### **Protected Routes**

```typescript
import { ProtectedRoute } from "@/auth-system/components/protected-route"

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>This is a protected dashboard</div>
    </ProtectedRoute>
  )
}

// Admin-only route
export default function AdminPanel() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  )
}
```

### **Using Auth Context**

```typescript
import { useAuth } from "@/auth-system/components/auth-provider"

export default function UserProfile() {
  const { user, profile, signOut, loading, isAdmin } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      <p>Role: {profile?.role}</p>
      {isAdmin && <p>You have admin privileges</p>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### **Server-Side Authentication**

```typescript
// app/api/protected/route.ts
import { requireAuth, requireAdmin } from "@/auth-system/lib/auth"

export async function GET() {
  const { user, profile } = await requireAuth()
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return Response.json({ 
    message: "Protected data",
    user: profile 
  })
}

// Admin-only API route
export async function POST() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!isAdmin) {
    return Response.json({ error: "Admin required" }, { status: 403 })
  }

  return Response.json({ message: "Admin action completed" })
}
```

### **Custom Auth Pages**

```typescript
// app/auth/login/page.tsx
import LoginPage from "@/auth-system/pages/login"

export default LoginPage
```

```typescript
// app/auth/signup/page.tsx  
import SignupPage from "@/auth-system/pages/signup"

export default SignupPage
```

```typescript
// app/auth/callback/page.tsx
import CallbackPage from "@/auth-system/pages/callback"

export default CallbackPage
```

## 🎨 Customization

### **Styling**

The components use Tailwind CSS classes. You can customize the appearance by:

1. **Modifying component styles** - Edit the className props in components
2. **Extending Tailwind config** - Add custom colors and animations
3. **Using CSS variables** - Define custom properties for consistent theming

### **Notifications**

Replace the basic notification utility with your preferred toast library:

```typescript
// auth-system/lib/notifications.ts
import { toast } from "sonner" // or react-hot-toast, react-toastify

export const notifications = {
  showSuccess: (message: string) => toast.success(message),
  showError: ({ title, description }: { title?: string, description: string }) => {
    toast.error(title ? `${title}: ${description}` : description)
  },
  // ... other methods
}
```

### **Form Components**

Replace the basic form inputs with your UI library components:

```typescript
// Replace input elements with your preferred UI library
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// etc.
```

## 🔧 Configuration

### **Role Configuration**

Modify roles in the database constraint:

```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'moderator', 'viewer', 'premium', 'guest'));
```

### **Middleware Paths**

Customize protected paths in your middleware:

```typescript
return await updateSession(request, {
  protectedPaths: ["/dashboard", "/profile", "/settings"],
  adminPaths: ["/admin", "/analytics"],
  moderatorPaths: ["/moderator", "/manage"],
  loginPath: "/auth/signin", // custom login path
  homePath: "/dashboard"     // custom redirect after login
})
```

### **Password Requirements**

Modify password requirements in `auth-validation.ts`:

```typescript
export const passwordRequirements = {
  minLength: 12,        // Increase minimum length
  maxLength: 256,       // Increase maximum length
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: false, // Make symbols optional
}
```

## 🗄️ Database Schema

### **Profiles Table**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users(id)` |
| `email` | TEXT | User email address |
| `full_name` | TEXT | User's full name |
| `role` | TEXT | User role: 'admin', 'moderator', 'viewer' |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last profile update |
| `last_login` | TIMESTAMPTZ | Last login timestamp |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `assigned_sports` | TEXT[] | Moderator: assigned sports |
| `assigned_venues` | TEXT[] | Moderator: assigned venues |
| `moderator_notes` | TEXT | Moderator: internal notes |

### **Key Functions**

- `is_admin_safe(user_id)` - Check if user is admin
- `is_moderator_safe(user_id)` - Check if user is moderator/admin  
- `get_user_role_safe(user_id)` - Get user role safely
- `validate_auth_state()` - Get complete auth state
- `handle_new_user()` - Trigger for new user registration

## 🔒 Security Features

### **Rate Limiting**

Built-in protection against brute force attacks:

- **5 attempts** per 15-minute window
- **1-hour block** after exceeding limits
- Applies to login, signup, and email verification

### **Row Level Security**

Database-level access control:

- Users can only edit their own profiles
- Admins can manage all profiles
- Public read access to active profiles

### **Password Security**

- Minimum 8 characters
- Requires uppercase, lowercase, numbers, and symbols
- Real-time strength validation
- Secure storage via Supabase Auth

## 🧪 Testing

### **Database Verification**

Run verification queries to ensure proper setup:

```sql
-- Verify migration status
SELECT * FROM public.verify_auth_migration();

-- Test auth functions
SELECT public.validate_auth_state();
SELECT public.is_admin_safe(null);

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### **Component Testing**

Test authentication flows:

```typescript
// Test login flow
const { result } = renderHook(() => useAuth())
await act(async () => {
  await result.current.signIn('test@example.com', 'password')
})
expect(result.current.user).toBeTruthy()
```

## 🐛 Troubleshooting

### **Common Issues**

1. **"Cannot find module" errors**
   - Ensure all dependencies are installed
   - Check import paths match your project structure

2. **Supabase connection errors**
   - Verify environment variables are correct
   - Check Supabase project is active
   - Ensure database setup script has been run

3. **Authentication not persisting**
   - Check middleware configuration
   - Verify cookies are allowed in browser
   - Ensure HTTPS in production

4. **Permission denied errors**
   - Run database setup script
   - Check RLS policies are enabled
   - Verify user roles are set correctly

### **Debug Mode**

Enable detailed logging:

```typescript
// In your auth provider or middleware
console.log("Auth debug:", {
  user: user?.id,
  role: profile?.role,
  path: request.nextUrl.pathname
})
```

## 📖 API Reference

### **AuthProvider Methods**

```typescript
interface AuthContextType {
  user: User | null                    // Current user object
  profile: Profile | null              // User profile data  
  loading: boolean                     // Loading state
  isAdmin: boolean                     // Admin role check
  isModerator: boolean                 // Moderator role check
  signIn: (email, password, rememberMe?) => Promise<AuthResponse>
  signUp: (email, password, fullName) => Promise<AuthResponse>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<AuthResponse>
  signInWithGithub: () => Promise<AuthResponse>
  resendVerificationEmail: (email) => Promise<AuthResponse>
  testConnection: () => Promise<boolean>
}
```

### **Server Helpers**

```typescript
// Get current user
const user = await getCurrentUser()

// Get current profile  
const profile = await getCurrentProfile()

// Require authentication
const { user, profile } = await requireAuth()

// Require admin role
const { user, profile, isAdmin } = await requireAdmin()

// Require moderator role
const { user, profile, isModerator } = await requireModerator()

// Check specific permission
const hasPermission = await hasPermission('admin.users')
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend-as-a-service platform
- **Next.js** - For the fantastic React framework
- **React Hook Form** - For excellent form management
- **Zod** - For runtime type validation
- **Tailwind CSS** - For utility-first styling

## 📞 Support

- **Documentation**: Check the [docs](./docs/) folder for detailed guides
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

---

**Built with ❤️ for the React/Next.js community**