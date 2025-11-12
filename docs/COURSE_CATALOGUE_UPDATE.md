# Course Catalogue Feature - Update Summary

## Overview
This document summarizes the updates made to support the new public course catalogue and course detail pages.

## Changes Made

### 1. Navigation Updates

#### Site Header (`components/site-header.tsx`)
- ✅ Added "Courses" link to main navigation (with BookOpen icon)
- ✅ Link points to `/courses` (public course catalogue)
- ✅ Available in both desktop and mobile navigation

#### Dashboard Layout (`components/dashboard-layout.tsx`)
- ✅ Added "Course Catalogue" link to learner sidebar navigation
- ✅ Points to `/courses` (public catalogue)
- ✅ Kept existing "Browse (Auth)" link for authenticated browsing

#### Site Footer (`components/site-footer.tsx`)
- ✅ Updated "Browse Courses" link to point to `/courses`
- ✅ Changed label to "Course Catalogue"

### 2. Learner Dashboard Updates (`app/learner/page.tsx`)
- ✅ Updated "Explore New Courses" card
- ✅ Added primary button linking to `/courses` (public catalogue)
- ✅ Kept secondary button for authenticated browse (`/learner/browse`)

## Database Verification

### Required Columns
The following columns should already exist in your database:

1. **courses table:**
   - `average_rating` (DECIMAL(3,2)) - Added by script `009_create_ratings_schema.sql`
   - `ratings_count` (INTEGER) - Added by script `009_create_ratings_schema.sql`
   - All other required columns exist from `002_create_courses_schema.sql`

### Required RLS Policies
The following policies should already exist:

1. **"Anyone can view published courses"** - Allows public access to published courses
   - Created in `002_create_courses_schema.sql`
   - This is essential for the public catalogue to work

2. **"Anyone can view ratings for published courses"** - Allows public viewing of ratings
   - Created in `009_create_ratings_schema.sql`

### Database Scripts to Run

#### Optional: Verification Script
Run `scripts/012_verify_course_catalogue_setup.sql` to:
- Verify `average_rating` and `ratings_count` columns exist (adds them if missing)
- Create performance indexes for better catalogue query performance:
  - `idx_courses_category` - For category filtering
  - `idx_courses_difficulty` - For difficulty filtering
  - `idx_courses_created_at` - For sorting by date

**To run the verification script:**
```sql
-- In Supabase SQL Editor or your database client
\i scripts/012_verify_course_catalogue_setup.sql
```

Or copy and paste the contents of the file into your SQL editor.

## New Routes

### Public Routes (No Authentication Required)
1. `/courses` - Course catalogue page
   - Shows all published courses
   - Includes search, filters, and sorting
   - Responsive grid layout

2. `/courses/[slug]` - Course detail page
   - Shows full course information
   - Hero banner, key facts, description
   - Lesson accordion, instructor bio
   - Resources and enrollment CTA
   - Login redirect for enroll/download actions

### Existing Routes (Still Available)
- `/learner/browse` - Authenticated course browsing (still functional)
- `/learner/courses` - User's enrolled courses (unchanged)

## Features

### Course Catalogue Page
- ✅ Public access (no login required)
- ✅ Responsive grid (1/2/3 columns)
- ✅ Search functionality
- ✅ Category and difficulty filters
- ✅ Sort options (newest, oldest, title, duration)
- ✅ Course cards with hover animations
- ✅ Skeleton loaders for slow networks
- ✅ Language badges
- ✅ Offline availability badges

### Course Detail Page
- ✅ Public access (no login required)
- ✅ Hero banner with course thumbnail
- ✅ Key facts section (lessons, duration, offline, certificate, languages)
- ✅ Course description
- ✅ Expandable lesson accordion
- ✅ Instructor bio
- ✅ Resources section (PDF syllabus, preview video)
- ✅ Enrollment CTA with progress bar
- ✅ Breadcrumb navigation
- ✅ Login redirect for enroll/download actions

## Testing Checklist

- [ ] Verify `/courses` page loads and displays published courses
- [ ] Test search functionality
- [ ] Test category and difficulty filters
- [ ] Test sorting options
- [ ] Verify course cards show correct information
- [ ] Test responsive layout on mobile, tablet, desktop
- [ ] Verify `/courses/[courseId]` detail page loads
- [ ] Test breadcrumb navigation
- [ ] Verify login redirect for enroll/download buttons (when not authenticated)
- [ ] Test enrollment flow (when authenticated)
- [ ] Verify navigation links in header, footer, and dashboard
- [ ] Check that RLS policies allow public access to published courses

## Notes

- The course catalogue uses course IDs as slugs (UUID format)
- All published courses are visible to the public
- Authentication is only required for enrollment and download actions
- The existing authenticated browse page (`/learner/browse`) remains available
- Ratings and reviews are supported (if ratings schema is set up)

## Next Steps

1. Run the verification script (`012_verify_course_catalogue_setup.sql`) if you haven't already
2. Test the public course catalogue
3. Verify RLS policies are working correctly
4. Test the enrollment flow from the public catalogue
5. Consider adding more course metadata if needed (e.g., tags, prerequisites)

