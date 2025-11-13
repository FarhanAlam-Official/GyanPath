# GyanPath - Build Plan (Phase 7.1 - Instructor Dashboard)

## Current Status

- ✅ Course creation page exists
- ✅ Lesson creation page exists
- ✅ Course list page exists
- ❌ Course edit/update functionality
- ❌ Lesson edit/update functionality
- ❌ Quiz management
- ❌ API endpoints for CRUD operations
- ❌ File upload for videos/PDFs
- ❌ Course publish workflow
- ❌ Lesson ordering/reordering

## Implementation Order

### Week 1: API Endpoints & Core CRUD

1. Create course CRUD API endpoints
2. Create lesson CRUD API endpoints
3. Create quiz CRUD API endpoints
4. Add file upload endpoints
5. Add publish/unpublish endpoints

### Week 2: UI Components & Forms

1. Create course edit form
2. Create lesson edit form
3. Create quiz builder
4. Add media library component
5. Add course preview

### Week 3: Advanced Features

1. Lesson reordering
2. Quiz question management
3. Course analytics
4. Bulk operations

### Week 4: Testing & Polish

1. Unit tests
2. Integration tests
3. Bug fixes
4. Performance optimization

## Files to Create/Modify

### API Routes

- `/app/api/courses/route.ts` - List & create courses
- `/app/api/courses/[id]/route.ts` - Get, update, delete course
- `/app/api/courses/[id]/publish/route.ts` - Publish course
- `/app/api/courses/[id]/lessons/route.ts` - Lesson CRUD
- `/app/api/courses/[id]/lessons/[lessonId]/route.ts` - Lesson detail
- `/app/api/courses/[id]/lessons/[lessonId]/quiz/route.ts` - Quiz CRUD
- `/app/api/upload/route.ts` - File upload

### Components

- `CourseEditForm` - Edit existing course
- `LessonEditForm` - Edit existing lesson
- `QuizBuilder` - Create/edit quizzes
- `MediaLibrary` - Upload and manage files
- `CoursePreview` - Preview course before publishing
- `LessonReorder` - Drag and drop lesson ordering

### Pages

- `/instructor/courses/[courseId]/edit` - Edit course
- `/instructor/courses/[courseId]/lessons/[lessonId]/edit` - Edit lesson
- `/instructor/courses/[courseId]/lessons/[lessonId]/quiz` - Manage quiz

## Database Migrations Needed

- Add `status` column to courses (draft, pending, approved, published)
- Add `published_at` timestamp to courses
- Add `view_count` to courses
- Add `explanation` and `explanation_ne` to quiz_questions
- Add `time_limit_minutes` to quizzes
- Add `shuffle_questions` to quizzes
- Add `allow_retry` to quizzes
- Add `retry_cooldown_hours` to quizzes
- Add `show_explanations` to quizzes

## Success Criteria

- [ ] Instructors can create courses
- [ ] Instructors can edit courses
- [ ] Instructors can delete courses
- [ ] Instructors can create lessons
- [ ] Instructors can edit lessons
- [ ] Instructors can delete lessons
- [ ] Instructors can reorder lessons
- [ ] Instructors can create quizzes
- [ ] Instructors can edit quizzes
- [ ] Instructors can upload videos/PDFs
- [ ] Instructors can publish courses
- [ ] Instructors can preview courses
- [ ] All CRUD operations tested
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Success notifications implemented
