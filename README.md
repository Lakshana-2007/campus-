# 🎓 Campus Hub

[![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.x-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Campus Hub** is an enterprise-grade, role-based academic portal that integrates students, faculty, placement coordinators, alumni, and administrators into a single cohesive campus ecosystem. Equipped with modern analytics, AI-assisted tutoring, plagiarism checks, and recruitment tracking, it provides a comprehensive digital platform for higher education institutions.

---

## 🌟 Key Features

### 🎓 Student Portal
* **Academic Dashboard:** Keep track of pending, submitted, and overdue assignments.
* **Attendance Tracking:** Real-time visibility into attendance statistics and trends.
* **AI Academic Tutor:** Direct chatbot interface for 24/7 intelligent tutoring and study assistance.
* **Placement Center:** View eligible careers, submit job applications, and track application states.
* **Alumni Hub:** Network directly with alumni for academic and industry mentorship.

### 👨‍🏫 Faculty Analytics & Instruction
* **Faculty Intelligence Dashboard:** Deep analytics on class performance, submission rates, and risk indices.
* **Course Work Management:** Post assignments with flexible deadlines and grade submissions directly with inline feedback.
* **Plagiarism Detector:** Built-in plagiarism report interface to inspect and analyze student submissions.
* **At-Risk Identification:** Algorithmic risk helper highlighting students falling behind in grades or attendance.

### 🎯 Placement Coordinator Center
* **Recruitment Monitor:** Comprehensive pipeline tracking job postings, student applicant status, and interviews.
* **Job Board Management:** Edit and manage listings, schedule mock and real interviews, and broadcast coordinator bulletins.
* **Analytics Center:** Visualize placements rates, top hiring sectors, and student hiring trends.

### 👥 Alumni Mentorship Network
* **Mentorship Board:** Advise active students, review profiles, and schedule counseling sessions.
* **Hub Messaging:** Real-time messaging to connect with fellow graduates and faculty.

### 👨‍💼 System Administration
* **Identity Management:** Complete user role administration (upgrade roles, disable accounts, and inspect login histories).
* **System Dashboard:** Visual analytics monitoring total system usage.

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Tailwind CSS, Lucide icons, Radix UI, TanStack Query, Recharts.
* **Backend:** Node.js, Express, REST APIs, Fallback Mock Engine.
* **Database & Integrations:** HuggingFace API / Language Model backend integration for the AI Tutor.

---

## 🔑 Login Credentials

Use the following credentials to explore various dashboards:

| Dashboard | Email | Password | Primary Interface |
|:---|:---|:---|:---|
| **Student** | `student@campus.edu` | `password123` | Tasks, Attendance, Placements, AI Tutor |
| **Faculty** | `faculty@campus.edu` | `password123` | Class Analytics, Assignments, Risk Engine |
| **Placement Coordinator** | `coordinator@campus.edu` | `password123` | Jobs, Interview Schedules, Placement Stats |
| **System Admin** | `admin@campus.edu` | `password123` | Full User Management, System Analytics |
| **Alumni** | `alumni@campus.edu` | `password123` | Mentorship Portal, Community Hub |

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18.x or above)
* npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Lakshana-2007/campus-.git
   cd campus-
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

4. Go to `http://localhost:5176` (or the URL outputted by Vite) in your browser.

---

## 📂 Project Structure

```
campus-/
├── backend/            # Express.js REST API & AI Service controllers
├── frontend/           # React dashboard UI, routing & analytics charts
└── campus-hub/         # Common project configurations
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
