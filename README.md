# GyanPath - Offline Learning Platform

GyanPath is a low-bandwidth, multilingual learning platform targeting rural users (starting in Nepal) where internet access is slow or intermittent. Its mission is to make education accessible offline.

## Features

- 🌐 **Offline-First PWA**: Download lessons and learn without internet
- 📚 **Course Management**: Create and manage courses with multimedia content
- 🎥 **Video Lessons**: Anti-skip video playback with progress tracking
- 🧠 **Quizzes & Assessments**: Interactive quizzes with real-time feedback
- 🏅 **Certificates**: Auto-generated PDF certificates with QR verification
- 👥 **Role-Based Access**: Admin, Group Admin, Instructor, and Learner roles
- 🌍 **Multilingual**: English and Nepali support (with more languages coming)
- 📊 **Analytics**: Comprehensive progress tracking and reporting

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PWA**: Service Workers, IndexedDB
- **State Management**: React Server Components, Server Actions

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GyanPath
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in the `scripts/` directory in order:
   - `001_create_database_schema.sql`
   - `002_create_courses_schema.sql`
   - `003_create_quiz_schema.sql`
   - `004_create_certificates_schema.sql`
   - `005_fix_profiles_rls_simple.sql`
3. Create storage buckets in Supabase Storage:
   - `videos` (for video files)
   - `pdfs` (for PDF documents)
   - `images` (for images and thumbnails)

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
GyanPath/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── instructor/        # Instructor dashboard
│   ├── learner/           # Learner dashboard
│   └── group-admin/       # Group admin dashboard
├── components/            # React components
│   └── ui/               # UI components (Radix UI)
├── lib/                   # Utility functions and configurations
│   └── supabase/         # Supabase client configurations
├── hooks/                 # Custom React hooks
├── public/                # Static assets
├── scripts/               # Database migration scripts
└── docs/                  # Documentation
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write comments for complex logic

### Git Workflow

- Create feature branches from `main`
- Commit messages should be descriptive
- Run `npm run lint` and `npm run type-check` before committing
- Pre-commit hooks will automatically format and lint your code

### Database Changes

- Create SQL migration scripts in the `scripts/` directory
- Name scripts with sequential numbers: `006_description.sql`
- Test migrations on a local Supabase instance first

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (your production URL)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license here]

## Support

For questions and support, please open an issue on GitHub or contact [your email].

