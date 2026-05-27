# 🎓 AI Placement Cell & Internship Management System

A comprehensive full-stack web application for managing campus placements with AI-powered features including resume analysis, smart eligibility matching, and an intelligent chatbot assistant.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![AI Powered](https://img.shields.io/badge/AI-OpenAI%20GPT--4-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### For Students
- **📊 Smart Dashboard** - View eligible drives, application status, and upcoming interviews
- **🎯 Intelligent Eligibility Matching** - Auto-filter drives based on CGPA, branch, skills
- **📄 AI Resume Analyzer** - Get ATS score, keyword suggestions, and improvement tips
- **💬 AI Chatbot Assistant** - 24/7 help for placement queries and interview prep
- **📝 One-Click Applications** - Apply to multiple drives with ease
- **🔔 Real-time Notifications** - Email and in-app updates for status changes

### For Admins
- **📈 Analytics Dashboard** - Charts for placement rates, company stats, branch-wise data
- **🏢 Company Management** - Add, edit, and manage partner companies
- **📋 Drive Management** - Create drives with eligibility criteria and selection rounds
- **👥 Student Management** - View profiles, applications, and placement history
- **📅 Interview Scheduling** - Bulk schedule interviews with email notifications
- **✅ Application Processing** - Update status with bulk actions

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **Recharts** for analytics charts
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **OpenAI GPT-4** for AI features
- **Nodemailer** for emails
- **PDF Parse** for resume extraction

## 📁 Project Structure

```
internship/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # Button, Card, Modal, etc.
│   │   │   ├── layout/       # Navbar, Sidebar, Layout
│   │   │   ├── auth/         # Login, Register, ProtectedRoute
│   │   │   └── chat/         # AI ChatWidget
│   │   ├── pages/
│   │   │   ├── student/      # Dashboard, Drives, Applications, Profile
│   │   │   └── admin/        # Dashboard, Companies, Drives, Students
│   │   ├── context/          # AuthContext
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Helper functions
│   └── index.html
│
├── backend/                  # Express backend
│   ├── models/               # Mongoose schemas
│   ├── controllers/          # Route handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, validation, error handling
│   ├── utils/                # AI, email, notifications
│   ├── config/               # DB, multer configuration
│   └── server.js             # Entry point
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

### 1. Clone & Setup

```bash
cd internship
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# Seed sample data
npm run seed

# Start server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@placement.com | admin123 |
| Student | john.doe@student.edu | student123 |
| Student | priya.sharma@student.edu | student123 |

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@placement.com

FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students/profile` - Get profile
- `PUT /api/students/profile` - Update profile
- `POST /api/students/resume/upload` - Upload resume
- `POST /api/students/resume/analyze` - AI analyze resume
- `GET /api/students/drives` - Get eligible drives
- `POST /api/students/apply/:driveId` - Apply to drive
- `GET /api/students/applications` - Get applications

### Admin
- `GET/POST /api/admin/companies` - Company CRUD
- `GET/POST /api/admin/drives` - Drive CRUD
- `GET /api/admin/students` - View students
- `PUT /api/admin/applications/:id/status` - Update status
- `POST /api/admin/schedule-interview` - Schedule interviews
- `GET /api/admin/analytics` - Dashboard analytics

### AI
- `POST /api/ai/chat` - Chat with AI assistant

## 🎨 Screenshots

### Student Dashboard
Modern dashboard with stats, eligible drives, and application tracking.

### AI Resume Analyzer
Upload resume and get instant ATS score with improvement suggestions.

### Admin Analytics
Charts and metrics for placement statistics and trends.

## 🔮 Future Enhancements

- [ ] Video interview integration
- [ ] Mock interview with AI
- [ ] Skill assessment tests
- [ ] Alumni mentorship matching
- [ ] Mobile app (React Native)
- [ ] WhatsApp notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for campus placements
