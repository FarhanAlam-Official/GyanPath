# 📘 GyanPath Product Requirements Document (PRD)

## 🧭 Overview & Goals

**GyanPath** is a low-bandwidth, multilingual learning platform targeting **rural users** (starting in Nepal) where internet access is slow or intermittent.  
Its mission is to make **education accessible offline**.

Learners can **download lessons (text, PDFs, images, videos)** when connected to a brief 3G/Wi-Fi session and continue learning offline.  
Using **Progressive Web App (PWA)** technology with **service workers**, content is cached locally, ensuring the app remains usable even without internet.

Inspired by *Edsy Bitsy* (an African edtech PWA), GyanPath follows the **“offline-first”** model:  
✅ Installable PWA  
✅ Cached lessons and videos  
✅ Automatic offline sync  

The platform will launch **bilingually (English and Nepali)**, with support for more languages via **Next.js i18n routing**.  
It will serve **both individual learners and institutional accounts (schools/NGOs)** with custom dashboards and analytics.

> “Offline mobile learning enhances access where networks are unavailable.” — *Wikipedia*

---

## 👥 User Roles & Permissions

| Role | Description |
|------|--------------|
| **Admin** | Full control: manage all users, groups, and content. Configure system-wide settings and view analytics. |
| **Group Admin (NGOs/Schools)** | Manage an organization’s users and courses. View group reports, enroll learners, and issue certificates. |
| **Instructor** | Create and manage courses, lessons, and quizzes. Review learner performance and generate reports. |
| **Learner** | Enroll in courses, download lessons, watch videos, take quizzes, and earn certificates. |

Role-based dashboards:

- Learners → course progress, certificates  
- Instructors → content management, student tracking  
- Admins → global analytics and configuration  

**Supabase Auth** handles authentication and **Row-Level Security (RLS)** enforces role-based content access.

---

## 🎓 Key Features

### 📚 Course & Content Management

- **Course Creation**: Multilingual titles & descriptions (`/en/course/xyz` vs `/ne/course/xyz` via Next.js i18n).  
- **Lessons**: Support for text, PDFs, images, and videos (stored in Supabase Storage).  
- **Bundled Downloads**: Cache full lesson bundles for offline access via Service Workers and IndexedDB.  
- **Optimized Uploads**: Compress PDFs/images/videos to minimize bandwidth use.

---

### 🎬 Video Playback & Anti-Skip

- **Offline Video Support**: Downloadable playback via Workbox caching strategies.  
- **Anti-Skip Mechanism**: Prevent learners from skipping ahead in videos until 90–100% completion.  
  - Implemented by listening to the `seeking` event and restoring the previous position if the user jumps forward.  
- **Completion Tracking**: Mark video complete only after full watch.

---

### 🧠 Quizzes & Assessments

- **Quiz Builder**: Instructors create multiple-choice questions with configurable scoring and thresholds.  
- **Real-Time Feedback**: Learners see pass/fail results instantly.  
- **Performance Insights**: Instructor dashboards display average scores, common mistakes, and quiz stats.  
- **Retry & Review**: Optional retries and explanations for incorrect answers.

---

### 🏅 Certificates & Badges

- **Auto-Generated PDF Certificates** using ReportLab and `qrcode` Python library.  
- Each includes learner’s name, course, date, and a **QR code for verification**.  
- **QR Verification System**: Scanning the code links to a public verification page.  
- **Customizable Templates**: Admins configure branding and layout.

---

### 📊 Analytics & Reporting

- **User Progress Tracking**: Lessons completed, quiz scores, watch time stored in Django/Postgres.  
- **Group Analytics**: School/NGO dashboards showing class-wide completion, averages, and bottlenecks.  
- **Engagement Metrics**: Logins, time spent, attempts, and activity heatmaps.  
- **Instructor Reports**: Identify difficult lessons based on aggregate quiz data.

---

## 🌐 Multilingual Interface (English & Nepali)

- **Language Routing**: Next.js locale routing (`/en`, `/ne`).  
- **Translations**: Static UI + dual-language content fields for lessons/courses.  
- **Fonts**: Noto Sans Devanagari for Nepali; Inter/Roboto for English.  
- **Auto-Detect + Toggle**: Detect browser language and allow manual switching.  
- **Responsive Layouts**: Adjust spacing and typography for varying text lengths.

---

## 💎 Modern UI/UX Design

- **Mobile-First Responsive Design** (Tailwind CSS)  
- **Accessibility**: WCAG 2.1 AA compliance — color contrast, alt text, aria labels.  
- **Brand Colors**:
  - `#190482` – Primary (Dark Indigo)  
  - `#7752FE` – Accent (Vivid Violet)  
  - `#8E8FFA` – Tertiary (Lavender)  
  - `#C2D9FF` – Background (Soft Blue)
- **Typography**: Clean sans-serif fonts for clarity and readability.  
- **Animations**: Framer Motion for smooth, non-intrusive transitions.  
- **Consistency**: Unified Tailwind theme for buttons, inputs, and cards.

---

## 🚀 Phase-by-Phase Roadmap

### **Phase 1 – MVP**

- User accounts & dashboards (Admin, Instructor, Group Admin, Learner)  
- Course & lesson management (text, PDFs, videos)  
- Offline-first PWA setup (service workers, caching)  
- Quizzes with pass/fail logic  
- Auto-generated certificates with QR codes  
- Supabase authentication & file storage  
- Basic analytics (progress reports)  
- English & Nepali UI (Next.js i18n)

---

### **Phase 2 – Growth**

- **Enhanced Offline Sync** using PowerSync or local queue + Supabase.  
- **Group Management Dashboards** and analytics.  
- **Engagement Features**: Comments, feedback, web push notifications.  
- **New Quiz Types** (True/False, Fill-in-the-Blank).  
- **Course Search & Recommendations**.  
- **Accessibility Enhancements** and more languages (Hindi, Newar).  
- **Dark Mode** support.

---

### **Phase 3 – Scaling**

- **Global CDN** for faster content delivery.  
- **Downloadable “Learning Packs”** (Kiwix/ZIM-style).  
- **Advanced Analytics & Machine Learning Insights**.  
- **Mobile App Wrappers** (Android/iOS).  
- **Integrations**: xAPI / SCORM compatibility.  
- **Monetization Options**: Donations or partnerships.

---

## 🧩 Functional Specifications & User Flows

### **Learner Flow**

1. Sign up → choose language → browse courses  
2. Enroll & download lesson bundle  
3. Study offline: read, watch video, take quiz  
4. Sync progress when online  
5. Earn certificate → download from dashboard  

### **Instructor Flow**

- Create multilingual courses  
- Upload lesson materials & set quizzes  
- Track student progress & results  
- Manage course updates  

### **Group Admin Flow**

- Create group → invite learners  
- Assign courses → view group analytics  
- Download progress reports  

### **Admin Flow**

- Manage all users, groups, and settings  
- Configure branding & access controls  
- Monitor global metrics  

---

## 🏗 Technical Architecture

**Frontend**:  

- Next.js (App Router) + React  
- Tailwind CSS + Framer Motion  
- PWA: Web App Manifest + Service Worker  
- i18n routing for multilingual UI  

**Backend**:  

- Django + Django REST Framework  
- Supabase (Postgres DB + Storage + Auth)  
- JWT-based role validation  
- REST APIs for content, quizzes, progress, and certificates  

**Storage**:  

- Supabase buckets for PDFs, images, and videos  
- CDN for faster delivery  
- Secure RLS-based access  

---

### 🗄 Database Schema (Simplified)

| Entity | Key Fields |
|--------|-------------|
| User | id, name, role, group_id |
| Group | id, name, admin_id |
| Course | id, title_en, title_np, desc_en, desc_np |
| Lesson | id, course_id, content, media_urls[], order |
| Quiz | id, lesson_id, passing_score |
| Question | id, quiz_id, text, options[] |
| AnswerOption | id, question_id, text, is_correct |
| UserProgress | user_id, lesson_id, progress%, score |
| Certificate | id, user_id, course_id, qr_code_url |

---

## ⚙️ Deployment & Optimization

- **Frontend** → Vercel (PWA + CDN)  
- **Backend** → Render / Railway / AWS / Heroku  
- **Database** → Supabase Postgres  
- **Performance**:
  - Gzip/Brotli compression  
  - Lazy-loading of media  
  - Caching strategies for slow networks  
  - CDN-accelerated content  

- **Testing**:
  - Simulated 2G/3G testing (Chrome DevTools)  
  - Offline bundle verification  
  - Unit + integration testing for sync logic  

---

## 🔐 Security & Monitoring

- Supabase Auth (JWT-based sessions)  
- HTTPS enforced  
- Secure file access via RLS policies  
- Input validation for uploads  
- Logging via Sentry or similar tools  
- Activity & error tracking via Supabase logs  

---

## 🎨 Branding & UI Style Guide

| Element | Description |
|----------|--------------|
| **Logo** | Clean, symbolic of learning path or progress arc |
| **Colors** | Indigo (#190482), Violet (#7752FE), Lavender (#8E8FFA), Blue (#C2D9FF) |
| **Fonts** | Inter (English), Noto Sans Devanagari (Nepali) |
| **Icons** | Lucide Icons |
| **Animations** | Framer Motion transitions |
| **Accessibility** | ARIA labels, semantic HTML, text alternatives |

---

> GyanPath brings **learning beyond connectivity** — empowering students to study anywhere, anytime, even offline.

---
