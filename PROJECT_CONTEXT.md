# Project Context: AI Placement Portal (Full‑Stack)

This document is a **high-signal overview** of the codebase so an AI assistant can quickly understand the architecture, flows, and where to make improvements.

## What this app does (1 paragraph)
An **AI-enabled campus placement portal** with 3 roles (**student**, **recruiter**, **admin**). Students maintain a profile, upload/analyze resumes, view eligible placement drives, and apply/withdraw applications. Recruiters create/manage job postings (drives), review applications, and manage interviews. Admins manage companies and drives, review/approve recruiters, manage applications at scale, export data, and view analytics. The app also has an authenticated AI chat feature and a notification system.

## Tech stack
- **Frontend**: React 19 + Vite + Tailwind + React Router + Axios + Framer Motion + `react-hot-toast`
- **Backend**: Express 5 + MongoDB (Mongoose) + JWT auth + `express-validator` + Helmet + CORS + rate-limits
- **Infra**: Docker Compose (MongoDB + backend + frontend)

## Repo layout
- `frontend/` React app
  - `src/App.jsx`: route map (student/admin/recruiter)
  - `src/services/api.js`: Axios client + API wrappers
  - `src/context/AuthContext.jsx`: auth state + `/auth/me` hydration
- `backend/` Express API
  - `server.js`: app bootstrap + middleware + route mounting
  - `routes/`: `auth`, `students`, `admin`, `recruiter`, `ai`, `notifications`
  - `controllers/`: request handlers per domain
  - `models/`: Mongoose schemas (User/Drive/Application/etc.)
- `docker-compose.yml`: MongoDB + backend + frontend services

## How to run (dev)
- Backend:
  - `cd backend && npm install`
  - `npm run dev` (starts `server.js` with nodemon)
- Frontend:
  - `cd frontend && npm install`
  - `npm run dev`

## Environment variables (high-level)
Backend expects (via `.env` or Docker):
- **Database**: `MONGODB_URI`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRE`
- **CORS**: `FRONTEND_URL`
- **Email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

Frontend expects:
- `VITE_API_URL` (defaults to `'/api'` if unset)

## Auth & security model
### Authentication
- JWT bearer tokens in `Authorization: Bearer <token>`
- Frontend stores token in **`sessionStorage`** (per-tab)
- `frontend/src/context/AuthContext.jsx` calls `GET /api/auth/me` to hydrate:
  - `user` (role/name/email/companyName/status/etc.)
  - `profile` for students (StudentProfile)

### Authorization
Backend middleware in `backend/middleware/auth.js`:
- `protect`: verifies JWT, loads `req.user`, checks `isActive`
- `authorize(...roles)`: role-based gate

### Rate limiting
In `backend/server.js`:
- General limiter on `/api/`
- Stricter limiter on auth routes (`/api/auth/login`, `/register`)
- Password reset limiter on `/api/auth/forgot-password`

## Roles and primary flows
### Student
- Create/update profile
- Upload resume, run AI analysis
- Browse eligible drives (eligibility based on profile + drive criteria)
- Apply to a drive, track application status history, withdraw application

### Recruiter
- View dashboard stats
- Create/update/delete jobs (implemented as Drives)
- Review applications; update application status
- View/manage interviews
- Update own profile + password

### Admin
- Manage companies CRUD
- Manage drives CRUD
- View drive applications; update statuses (including bulk updates)
- Approve/reject recruiter accounts
- Analytics + exports

## Core data models (MongoDB)
### `User` (`backend/models/User.js`)
- Identity: `name`, `email`, `phone`, `password`
- Role: `role: student | admin | recruiter`
- Recruiter approval flow: `accountStatus: pending | approved | rejected`, `rejectionReason`
- Security: `isActive`, `loginAttempts`, `lockUntil`, reset/verify tokens

### `StudentProfile` (`backend/models/StudentProfile.js`)
- `userId` (unique) → User
- Profile fields: name, rollNumber, branch, semester, cgpa, backlogs, phone, skills, projects, links, about
- `appliedDrives`: [DriveId]
- `profileCompleteness` computed in pre-save

### `Company` (`backend/models/Company.js`)
- `companyName`, `industry`, `website`, `description`, `logoUrl`
- contact + metadata

### `Drive` (`backend/models/Drive.js`)
- `companyId` → Company
- Job fields: `roleTitle`, `roleDescription`, `jobType`, `package`, `stipend`, `location`, `workMode`
- Eligibility: `minCGPA`, `allowedBranches` (supports `'All'`), `maxBacklogs`, `minSemester`, `requiredSkills`
- Ops: `applicationDeadline`, `driveStatus`, `selectionProcess`, `numberOfOpenings`
- Counts: `applicantCount`, `selectedCount`
- `postedBy` → User (admin/recruiter)

### `Application` (`backend/models/Application.js`)
- `driveId` → Drive
- `studentId` → StudentProfile
- `userId` → User
- `applicationStatus`: applied | under-review | shortlisted | interview-scheduled | selected | rejected | withdrawn
- `resumeUrl`, optional `resumeScore`, `coverLetter`
- `interviewDetails[]` (date/time/venue/meetingLink/round)
- `statusHistory[]` tracks status changes

### `Notification` (`backend/models/Notification.js`)
- `userId` → User
- `title`, `message`, `type`, optional `link`, `isRead`, `emailSent`

### AI-related models
- `ChatSession` (`backend/models/ChatSession.js`): stored chat history per user
- `ResumeReview` (`backend/models/ResumeReview.js`): ATS score + AI analysis results

## Backend API surface (by router)
Mounted in `backend/server.js` under `/api/*`.

### Auth (`backend/routes/auth.js`) → `/api/auth`
- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `PUT /reset-password/:token`
- `GET /verify-email/:token`
- `GET /me` (protected)
- `PUT /password` (protected)
- `POST /resend-verification` (protected)
- `POST /logout` (protected)

### Students (`backend/routes/students.js`) → `/api/students` (protected + student role)
- `GET /profile`
- `PUT /profile`
- `POST /profile/picture`
- `POST /resume/upload`
- `POST /resume/analyze`
- `GET /resume/analysis`
- `GET /drives`
- `GET /drives/:id`
- `POST /apply/:driveId`
- `GET /applications`
- `GET /applications/:id`
- `PUT /applications/:id/withdraw`

### Admin (`backend/routes/admin.js`) → `/api/admin` (protected + admin role)
- User management: `POST /create-user`
- Companies: `GET/POST /companies`, `GET/PUT/DELETE /companies/:id`
- Drives: `GET/POST /drives`, `GET/PUT/DELETE /drives/:id`, `GET /drives/:id/applications`
- Applications: `PUT /applications/:id/status`, `PUT /applications/bulk-status`
- Interviews: `POST /schedule-interview`
- Students: `GET /students`, `GET /students/:id`
- Recruiters: `GET /recruiters`, `GET /recruiters/pending`, `PUT /recruiters/:id/approve`, `PUT /recruiters/:id/reject`
- Analytics: `GET /analytics`
- Exports: `GET /export/students`, `GET /export/placements`, `GET /export/drives/:id/applications`

### Recruiter (`backend/routes/recruiter.js`) → `/api/recruiter` (protected + recruiter role)
- Dashboard: `GET /dashboard`
- Companies list: `GET /companies`
- Jobs (Drives): `GET/POST /jobs`, `GET/PUT/DELETE /jobs/:id`
- Applications: `GET /applications`, `PUT /applications/:id/status`
- Interviews: `GET /interviews`, `POST /interviews`, `PUT /interviews/:id`, `DELETE /interviews/:id`
- Settings: `PUT /profile`, `PUT /password`

### AI (`backend/routes/ai.js`) → `/api/ai` (protected)
- `POST /chat` (rate limited)
- `GET /chat/history`
- `POST /chat/new`
- `DELETE /chat/:sessionId`

### Notifications (`backend/routes/notifications.js`) → `/api/notifications` (protected)
- `GET /`
- `GET /unread-count`
- `PUT /read-all`
- `PUT /:id/read`
- `DELETE /:id`
- `DELETE /clear-all`

## Frontend route map (React Router)
Defined in `frontend/src/App.jsx`.

### Public
- `/login`, `/register` (inside `AuthLayout`)
- `/forgot-password`, `/reset-password`

### Student (protected role: `student`)
- `/dashboard` → student dashboard
- `/drives` → browse eligible drives + apply
- `/applications` → application tracking
- `/profile` → profile editor
- `/resume-analyzer` → resume analysis UI

### Admin (protected role: `admin`)
- `/admin/dashboard`
- `/admin/companies`
- `/admin/drives`
- `/admin/students`
- `/admin/recruiters`
- `/admin/settings`

### Recruiter (protected role: `recruiter`)
- `/recruiter/dashboard`
- `/recruiter/jobs`
- `/recruiter/applications`
- `/recruiter/interviews`
- `/recruiter/settings`

## Where to start reading (recommended)
If you’re a new contributor (or an AI):
- Backend:
  - `backend/server.js` (middleware + route mounting)
  - `backend/middleware/auth.js` (JWT + RBAC)
  - `backend/routes/*.js` then `backend/controllers/*.js`
  - `backend/models/*.js`
- Frontend:
  - `frontend/src/App.jsx` (route map)
  - `frontend/src/context/AuthContext.jsx` (auth hydration + login/register)
  - `frontend/src/services/api.js` (API contract)

## Known risk areas / improvement targets (AI review checklist)
- **API contract drift**: confirm frontend API wrappers match backend routes (method + params)
- **Validation**: ensure numeric parsing/NaN guards everywhere (forms + payloads)
- **Status enums**: align frontend filters with backend enums (`applicationStatus`, `driveStatus`)
- **Security**: confirm CORS policy + rate limits + error handling are production-ready
- **Files/secrets**: never commit `.env`, keep `.env.example` safe

## Prompt to give an AI after uploading this doc
“Read `PROJECT_CONTEXT.md`, then scan routes/controllers/models to produce:
1) architecture summary, 2) entity relationship map, 3) key user flows per role,
4) top 10 bugs/edge cases/security issues, 5) a phased improvement roadmap.”

