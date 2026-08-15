# TradeAcademy — Stock Market Learning & Trading Education Platform

## Original Problem Statement
Build a modern, professional, responsive Stock Market Learning & Trading Education Platform. Structured education for beginners → advanced: fundamentals, technical analysis, strategies, risk management, trading psychology. Premium, trustworthy design (dark navy/charcoal + emerald accents). No profit/return guarantees. Free signup, student dashboard with progress tracking, 18-module course, lesson player (video, objectives, mark complete, prev/next), pricing placeholders (Free/Full/Premium), live sessions, testimonials, FAQ, contact, admin panel, future-ready payment architecture, SEO-friendly.

## User Choices
- Auth: BOTH JWT email/password AND Emergent-managed Google login
- Working admin panel (not just architecture)
- Lesson videos via YouTube/video URL embeds
- Seed all 18 modules + demo student account
- Design: defer to designer → premium dark navy + emerald ("Old Money Tech")

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) + MongoDB (motor). Seed in `seed.py` runs on startup.
  - Auth: JWT (bcrypt) + Emergent Google session (`user_sessions`, httpOnly cookie). `get_current_user` accepts JWT Bearer OR session_token (cookie/Bearer). `admin_user` RBAC.
  - Collections: users, user_sessions, courses, modules, lessons, progress, live_sessions, testimonials, contacts.
  - Routes (all `/api`): auth (register/login/google/me/logout/forgot/profile), courses, lessons, progress (complete/uncomplete), live-sessions, testimonials, contact, admin CRUD (courses/modules/lessons/live-sessions/testimonials) + stats/users/contacts.
- **Frontend**: React 19 + react-router 7 + Tailwind + shadcn/ui + framer-motion + sonner.
  - Fonts: Cabinet Grotesk (headings), IBM Plex Sans (body), JetBrains Mono (numbers).
  - Pages: Landing, Courses, LiveSessions, Contact, Login, Register, ForgotPassword, Dashboard, LessonView, Profile, Admin. AuthContext + ProtectedRoute + AuthCallback.

## Test Credentials
- Student: student@demo.com / Demo1234 (has some completed lessons)
- Admin: admin@demo.com / Admin1234

## Implemented (2026-08-15)
- Hero, Why Learn With Us, How It Works, Course preview, About, Pricing, Testimonials, FAQ, CTA on landing
- Free signup/login/forgot/logout/profile; JWT + Google
- Student dashboard: welcome, progress %, modules, completed/upcoming lessons, Continue Learning
- Course page (18 modules accordion) + lesson player (video embed, objectives, mark complete, prev/next)
- Live sessions, testimonials, contact form (persisted)
- Full admin panel: stats, users+progress, content (module/lesson CRUD), live sessions CRUD, testimonials CRUD, messages
- SEO meta/title, semantic H1/H2/H3, alt text, responsive + mobile hamburger
- Verified: backend 22/22 pytest, frontend 100% of tested flows

## Backlog / Remaining
- **P1**: Real payment integration (Razorpay/Cashfree) — architecture/placeholders ready, not activated (no credentials).
- **P2**: Testimonials edit (PUT) endpoint; admin course-level CRUD UI; cascade delete for courses.
- **P2**: Real email for forgot-password (currently mocked no-op); real live-session join links.
- **P2**: Dashboard loading skeletons; 401 interceptor to suppress pre-login console error.

## MOCKED (not live)
- Forgot-password (no email sent), Live "Join Session" (info toast only), Payments/pricing (placeholders only).
