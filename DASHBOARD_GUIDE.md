# Campus Hub - Role-Based Dashboard Guide

## 🎓 Student Dashboard
**Login as:** `student@campus.edu` / `password123`

### Available Features:
- **Dashboard** - View assignment overview (pending, submitted, overdue)
- **Assignments** - Browse and view all assignments with deadlines
- **Submit Assignment** - Upload submissions for assignments
- **Attendance Overview** - View your attendance records
- **Placements** - View eligible job postings and apply
- **Alumni Hub** - Connect with alumni and mentors
- **Chatbot** - AI tutor for academic help
- **Profile** - Edit your student profile
- **Messages** - Communicate with faculty and alumni

**Main Route:** `/dashboard`

---

## 👨‍🏫 Faculty Dashboard
**Login as:** `faculty@campus.edu` / `password123`

### Available Features:
- **Faculty Intelligence Dashboard** - View analytics and student performance
  - Total assignments created
  - Total submissions received
  - Late submission rate
  - Flagged plagiarism cases

- **Create Assignment** - Post new assignments with deadlines
- **View Submissions** - Review student submissions and add feedback
- **Mark Attendance** - Track and record student attendance
- **Analytics** - Detailed insights on student performance and trends
- **Plagiarism Report** - Check submission originality and detect plagiarism
- **Risk Assessment** - Identify at-risk students based on performance
- **Profile** - Edit your faculty profile
- **Messages** - Communicate with students

**Main Route:** `/dashboard`

---

## 🎯 Placement Coordinator Dashboard
**Login as:** `coordinator@campus.edu` / `password123`

### Available Features:
- **Placement Coordinator Dashboard** - Manage placement activities
- **Manage Placements** - Post jobs, schedule interviews, manage applications
- **Placement Stats** - View placement analytics and statistics
- **Jobs** - Create and manage job postings
- **Announcements** - Post placement announcements
- **Interview Lists** - Schedule and manage interviews
- **Profile** - Edit profile information

**Main Route:** `/dashboard`

---

## 👨‍💼 Admin Dashboard
**Login as:** `admin@campus.edu` / `password123`

### Available Features:
- **Student Dashboard** (shown as default for admin)
- **Manage Users** - View, edit, and manage all user accounts
  - Change user roles (student, faculty, admin, etc.)
  - Delete users
  - View user details and analytics

- **Manage Placements** - Complete placement management
- **Analytics** - System-wide analytics and reports
- **Profile** - Edit admin profile

**Main Route:** `/dashboard`

---

## 👥 Alumni Dashboard
**Login as:** `alumni@campus.edu` / `password123`

### Available Features:
- **Alumni Dashboard** - Overview of alumni activities
- **Mentorship** - Mentor current students
- **Alumni Hub** - Connect with other alumni
- **Messages** - Stay in touch with students and alumni
- **Profile** - Edit alumni profile

**Main Route:** `/dashboard`

---

## 🔑 Test Credentials Summary

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Student | `student@campus.edu` | `password123` | Student Dashboard |
| Faculty | `faculty@campus.edu` | `password123` | Faculty Intelligence Dashboard |
| Coordinator | `coordinator@campus.edu` | `password123` | Placement Coordinator Dashboard |
| Admin | `admin@campus.edu` | `password123` | Admin Dashboard |
| Alumni | `alumni@campus.edu` | `password123` | Alumni Dashboard |

---

## 🚀 How to Use

1. Go to **http://localhost:5176/**
2. Click **Login** (top right or login page)
3. Enter any of the credentials above
4. You'll be redirected to your role-specific dashboard
5. Navigate through the sidebar to access different features

---

## 📱 Frontend Features Loaded

Each dashboard automatically loads ALL features for that role:
- ✅ No data loading errors (uses mock data if DB unavailable)
- ✅ All API endpoints have fallback support
- ✅ Full role-based access control

---

**Last Updated:** April 16, 2026
