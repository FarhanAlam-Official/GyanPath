# GyanPath Sample Data Scripts

This folder contains modular sample-data scripts that can be run in sequence to
bootstrap a development or demo environment. Each subdirectory focuses on a
specific domain (profiles, groups, courses, etc.) so you can seed only the data
you need.

## Execution Order

Run the scripts in the following order:

1. `common/001_helpers.sql`
2. `profiles/002_insert_profiles_sample.sql`
3. `groups/003_insert_groups_sample.sql`
4. `courses/004_insert_courses_sample.sql`
5. `lessons/005_insert_lessons_sample.sql`
6. `enrollments/006_insert_enrollments_progress_sample.sql`
7. `quizzes/007_insert_quizzes_sample.sql`
8. `comments/008_insert_comments_sample.sql`
9. `ratings/009_insert_ratings_sample.sql`
10. `certificates/010_insert_certificates_sample.sql`

Each script is idempotent—running it multiple times will update existing rows
instead of producing duplicates.

## Prerequisites

1. All base schema scripts (`scripts/001` through `scripts/012`) must be applied.
2. Create the following auth users in Supabase Auth (dashboard or admin API):
   - `admin@gyanpath.test`
   - `groupadmin1@gyanpath.test`
   - `instructor1@gyanpath.test`
   - `instructor2@gyanpath.test`
   - `learner1@gyanpath.test`
   - `learner2@gyanpath.test`
   - `learner3@gyanpath.test`

   The sample scripts will stop with a clear error message if any of these users
   are missing.

3. Run each SQL file in Supabase SQL Editor (or psql) using the order above.

## Cleaning Up

If you want to remove the sample data later, you can delete rows by matching on
the static UUIDs or the unique titles/emails used in these scripts. The scripts
do not remove data automatically.
