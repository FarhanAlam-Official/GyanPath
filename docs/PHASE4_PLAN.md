# Phase 4: Enhanced User Experience

## Overview
Phase 4 focuses on improving user engagement, discoverability, and interactivity through search, recommendations, discussions, and feedback systems.

## Features to Implement

### 4.1 Course Search & Filtering 🔍
**Priority: High**

**Features:**
- Real-time search by course title, description
- Filter by category, difficulty level, instructor
- Sort by: newest, popularity, duration, rating
- Advanced filters: enrolled/not enrolled, completion status
- Search suggestions and autocomplete

**Implementation:**
- Database: Add full-text search indexes on courses table
- API: `/api/courses/search` endpoint with query params
- UI: Search bar component, filter sidebar, sort dropdown
- Components: `CourseSearchBar`, `CourseFilters`, `CourseSortOptions`

**Files to Create/Modify:**
- `app/api/courses/search/route.ts`
- `components/course-search-bar.tsx`
- `components/course-filters.tsx`
- `components/course-sort-options.tsx`
- `app/learner/browse/page.tsx` (enhance with search/filter)
- `lib/utils/search.ts` (search utilities)

---

### 4.2 Course Recommendations 🎯
**Priority: High**

**Features:**
- Personalized recommendations based on:
  - User's enrolled courses and categories
  - Completion history and preferences
  - Similar users' enrollments (collaborative filtering)
- "Recommended for you" section
- "Popular courses" section
- "Similar courses" suggestions
- "Continue learning" based on progress

**Implementation:**
- Algorithm: Collaborative filtering + content-based filtering
- API: `/api/courses/recommendations` endpoint
- Components: `CourseRecommendations`, `RecommendedCoursesList`
- Cache recommendations for performance

**Files to Create/Modify:**
- `app/api/courses/recommendations/route.ts`
- `lib/utils/recommendations.ts`
- `components/course-recommendations.tsx`
- `app/learner/page.tsx` (add recommendations section)
- `app/learner/browse/page.tsx` (add recommended section)

---

### 4.3 Comments & Discussions 💬
**Priority: Medium**

**Features:**
- Add comments to lessons
- Reply to comments (nested comments)
- Like/dislike comments
- Mark helpful comments
- Instructor moderation
- Real-time updates (optional)

**Database Schema:**
```sql
CREATE TABLE lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_helpful BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(comment_id, user_id)
);
```

**Implementation:**
- API: CRUD endpoints for comments
- Components: `LessonComments`, `CommentForm`, `CommentItem`, `CommentReplies`
- Real-time: Optional WebSocket/Server-Sent Events

**Files to Create/Modify:**
- `scripts/004_create_comments_schema.sql`
- `app/api/comments/route.ts` (GET, POST)
- `app/api/comments/[id]/route.ts` (PUT, DELETE)
- `app/api/comments/[id]/like/route.ts`
- `components/lesson-comments.tsx`
- `components/comment-form.tsx`
- `components/comment-item.tsx`
- `app/learner/courses/[courseId]/lessons/[lessonId]/page.tsx` (add comments section)

---

### 4.4 Course Feedback & Ratings ⭐
**Priority: Medium**

**Features:**
- Rate courses (1-5 stars)
- Write reviews/feedback
- View average ratings
- Filter courses by rating
- Helpful votes on reviews
- Instructor responses to reviews

**Database Schema:**
```sql
CREATE TABLE course_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE TABLE rating_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating_id UUID REFERENCES course_ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(rating_id, user_id)
);

-- Add average_rating column to courses table
ALTER TABLE courses ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN ratings_count INTEGER DEFAULT 0;
```

**Implementation:**
- API: Rating/review endpoints
- Components: `CourseRating`, `RatingForm`, `ReviewList`, `StarRating`
- Update course cards to show ratings

**Files to Create/Modify:**
- `scripts/005_create_ratings_schema.sql`
- `app/api/courses/[id]/ratings/route.ts`
- `app/api/ratings/[id]/route.ts`
- `app/api/ratings/[id]/helpful/route.ts`
- `components/course-rating.tsx`
- `components/rating-form.tsx`
- `components/review-list.tsx`
- `components/star-rating.tsx`
- Update course cards to display ratings

---

### 4.5 Enhanced Quiz Types 🧠
**Priority: Medium**

**Features:**
- **True/False Questions**: Simple yes/no questions
- **Fill-in-the-Blank**: Text input answers
- **Multiple Select**: Multiple correct answers
- **Ordering**: Drag-and-drop sequence questions
- Enhanced quiz builder UI
- Question type indicators

**Database Schema:**
```sql
-- Update questions table to support new types
ALTER TABLE questions ADD COLUMN question_type TEXT DEFAULT 'multiple_choice' 
  CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'multiple_select', 'ordering'));

-- For fill-in-the-blank: Store correct answer as text
-- For true/false: Store as boolean in answer_options
-- For multiple_select: Multiple correct options
-- For ordering: Store order sequence
```

**Implementation:**
- Update quiz builder to support new types
- Update quiz taker to handle new question types
- Add validation for each type
- Update scoring logic

**Files to Create/Modify:**
- `scripts/006_update_quiz_schema.sql`
- `components/quiz-builder.tsx` (enhance with new types)
- `components/quiz-taker.tsx` (handle new types)
- `components/question-types/true-false-question.tsx`
- `components/question-types/fill-blank-question.tsx`
- `components/question-types/multiple-select-question.tsx`
- `components/question-types/ordering-question.tsx`
- `lib/utils/quiz-validation.ts`

---

### 4.6 Accessibility Enhancements ♿
**Priority: Low-Medium**

**Features:**
- Enhanced ARIA labels and roles
- Keyboard navigation support
- Screen reader optimization
- Focus management
- High contrast mode support
- Skip to content links
- Alt text for all images
- Form validation announcements

**Implementation:**
- Audit all components for accessibility
- Add ARIA attributes where missing
- Implement keyboard shortcuts
- Test with screen readers
- Add focus indicators
- Ensure color contrast ratios meet WCAG AA

**Files to Modify:**
- All component files (add ARIA labels)
- `components/skip-to-content.tsx` (new)
- `app/globals.css` (focus styles, high contrast)
- `components/accessibility-menu.tsx` (new - font size, contrast)

---

## Implementation Order

1. **Week 1: Search & Filtering**
   - Database indexes
   - Search API
   - Search UI components
   - Filter sidebar
   - Integration with browse page

2. **Week 2: Recommendations**
   - Recommendation algorithm
   - Recommendations API
   - UI components
   - Integration with dashboard

3. **Week 3: Comments**
   - Database schema
   - Comments API
   - Comments UI
   - Integration with lesson pages

4. **Week 4: Ratings & Feedback**
   - Database schema
   - Ratings API
   - Rating UI components
   - Integration with course pages

5. **Week 5: Enhanced Quiz Types**
   - Database updates
   - Quiz builder enhancements
   - Quiz taker updates
   - Validation logic

6. **Week 6: Accessibility**
   - Component audits
   - ARIA enhancements
   - Keyboard navigation
   - Testing

---

## Success Metrics

- **Search**: Users can find courses 50% faster
- **Recommendations**: 30% increase in course enrollments from recommendations
- **Comments**: Average 2+ comments per lesson
- **Ratings**: 60% of completed courses have ratings
- **Accessibility**: 100% WCAG AA compliance

---

## Testing Checklist

- [ ] Search works with various queries
- [ ] Filters apply correctly
- [ ] Recommendations are relevant
- [ ] Comments can be added/edited/deleted
- [ ] Ratings display correctly
- [ ] All quiz types work properly
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader compatibility
- [ ] Mobile responsiveness
- [ ] Performance (search speed, recommendations load time)

---

## Next Phase Preview

After Phase 4, we'll move to:
- **Phase 5**: Performance Optimization & Security
- **Phase 6**: Testing & Quality Assurance
- **Phase 7**: Deployment & DevOps

