# Sample Data Setup Guide

## Overview
This guide explains how to set up sample data for the GyanPath application using the `013_insert_sample_data.sql` script.

## Prerequisites

1. **All schema scripts must be run first** (001-012)
2. **Create auth.users** before running the sample data script

## Step 1: Create Auth Users

Before running the sample data script, you need to create users in Supabase Auth. You can do this in two ways:

### Option A: Using Supabase Dashboard
1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User" for each user below
3. Use these email addresses:
   - `admin@gyanpath.test`
   - `instructor1@gyanpath.test`
   - `instructor2@gyanpath.test`
   - `learner1@gyanpath.test`
   - `learner2@gyanpath.test`
   - `learner3@gyanpath.test`
   - `groupadmin1@gyanpath.test`

### Option B: Using Supabase Auth API
```bash
# Example using curl (replace with your Supabase project URL and service role key)
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gyanpath.test",
    "password": "TestPassword123!",
    "email_confirm": true
  }'
```

Repeat for all 7 users listed above.

## Step 2: Update User IDs in Script (Optional)

If you want to use different email addresses or already have users, you can:

1. Find the user IDs from `auth.users` table
2. Update the email addresses in the script (lines 150-156)
3. Or manually set the UUID variables at the beginning of the DO block

## Step 3: Run the Sample Data Script

1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `scripts/013_insert_sample_data.sql`
3. Click "Run" or press Ctrl+Enter

The script will:
- Insert 7 profiles (admin, 2 instructors, 3 learners, 1 group admin)
- Create 1 group with 3 members
- Create 4 courses (3 published, 1 draft)
- Create 6 lessons across the courses
- Create 5 course enrollments
- Create lesson progress records
- Create 2 quizzes with questions and options
- Create 2 quiz attempts with answers
- Create 2 certificates
- Create 2 comments with likes
- Create 4 course ratings with helpful votes

## Step 4: Verify Data

After running the script, verify the data:

```sql
-- Check profiles
SELECT id, email, full_name, role FROM public.profiles;

-- Check courses
SELECT id, title, is_published, instructor_id FROM public.courses;

-- Check enrollments
SELECT course_id, user_id, progress_percentage FROM public.course_enrollments;

-- Check ratings
SELECT course_id, rating, review FROM public.course_ratings;
```

## Sample Data Summary

### Users Created:
- **Admin**: admin@gyanpath.test
- **Instructors**: 
  - instructor1@gyanpath.test (Dr. Sarah Johnson)
  - instructor2@gyanpath.test (Prof. Ram Shrestha)
- **Learners**:
  - learner1@gyanpath.test (Amit Kumar)
  - learner2@gyanpath.test (Priya Sharma) - Has completed courses
  - learner3@gyanpath.test (Raj Thapa)
- **Group Admin**: groupadmin1@gyanpath.test

### Courses Created:
1. **Introduction to Digital Literacy** (Published, Beginner, Technology)
   - 3 lessons
   - 2 enrollments
   - 2 ratings

2. **Agricultural Best Practices** (Published, Intermediate, Agriculture)
   - 2 lessons
   - 2 enrollments
   - 1 rating

3. **Basic English Communication** (Published, Beginner, Language)
   - 1 lesson
   - 1 enrollment (completed)
   - 1 rating

4. **Advanced Web Development** (Draft, Advanced, Technology)
   - Not published yet

### Test Scenarios Covered:
- ✅ Published and draft courses
- ✅ Multiple enrollments per course
- ✅ Different progress percentages
- ✅ Completed courses (100% progress)
- ✅ Quiz attempts (passed and failed)
- ✅ Certificates for completed courses
- ✅ Comments and likes
- ✅ Course ratings and helpful votes
- ✅ Group membership

## Troubleshooting

### Error: "User not found"
- Make sure you've created all 7 users in auth.users first
- Check that email addresses match exactly

### Error: "RLS policy violation"
- The script uses SECURITY DEFINER functions to bypass RLS
- If you still get errors, check that the functions were created successfully

### Error: "Foreign key constraint"
- Ensure all schema scripts (001-012) have been run
- Check that referenced tables exist

### Data not appearing in UI
- Clear browser cache
- Check that courses are published (`is_published = true`)
- Verify RLS policies allow viewing the data

## Next Steps

After inserting sample data:
1. Test the course catalogue at `/courses`
2. Test course detail pages
3. Test enrollment flow
4. Test quiz taking
5. Test certificate generation
6. Test comments and ratings

## Cleanup (Optional)

To remove all sample data:

```sql
-- WARNING: This will delete all data, not just sample data
-- Only run if you want to start fresh

DELETE FROM public.rating_helpful_votes;
DELETE FROM public.course_ratings;
DELETE FROM public.comment_likes;
DELETE FROM public.lesson_comments;
DELETE FROM public.certificates;
DELETE FROM public.quiz_answers;
DELETE FROM public.quiz_attempts;
DELETE FROM public.quiz_options;
DELETE FROM public.quiz_questions;
DELETE FROM public.quizzes;
DELETE FROM public.lesson_progress;
DELETE FROM public.course_enrollments;
DELETE FROM public.lessons;
DELETE FROM public.courses;
DELETE FROM public.group_members;
DELETE FROM public.groups;
-- Keep profiles and auth.users for actual users
```

