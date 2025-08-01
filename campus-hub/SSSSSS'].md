# 🧪 CampusHub - Test Credentials & Access Guide

## Quick Start

All test accounts are **ready to use** in the application. No additional setup required!

### How to Access Test Credentials in the App

1. **From Login Page**: Click the "View All Test Credentials" button at the bottom
2. **Direct Link**: Visit `http://localhost:5173/test-credentials`
3. **From Landing Page**: Click the test credentials link at the bottom of the page

---

## 📋 All Test Accounts

### 👨‍🎓 **Student Account**
- **Email**: `student@campushub.edu`
- **Password**: `student123`
- **Name**: John Doe
- **CGPA**: 8.5 | **Semester**: 6
- **Permissions**:
  - View & submit assignments
  - Track attendance
  - Browse job opportunities
  - Use AI job recommendations
  - Chat with AI tutor
  - Connect with alumni
  - View grades & feedback

### 👨‍🏫 **Faculty Account**
- **Email**: `faculty@campus.edu`
- **Password**: `password123`
- **Name**: Dr. Sarah Smith
- **Department**: Computer Science
- **Permissions**:
  - Create assignments
  - Grade submissions
  - Check plagiarism on work
  - Mark student attendance
  - View class analytics
  - Risk assessment (identify at-risk students)
  - Manage events

### 👔 **Placement Coordinator**
- **Email**: `coordinator@campus.edu`
- **Password**: `password123`
- **Name**: Mr. Placement Officer
- **Department**: Computer Science
- **Permissions**:
  - Post job opportunities
  - Manage student applications
  - Match students with jobs
  - Schedule interviews
  - Track placement status
  - View placement analytics
  - Create announcements

### 🔑 **Admin Account**
- **Email**: `admin@campushub.edu`
- **Password**: `admin123`
- **Name**: Admin Manager
- **Department**: Administration
- **Permissions**:
  - Manage all users (create, edit, delete)
  - Manage courses
  - Manage assignments
  - View system analytics
  - System configuration
  - Backup & maintenance
  - Access all reports

### 🎯 **Alumni Account**
- **Email**: `alumni@campushub.edu`
- **Password**: `password123`
- **Name**: Jane Alum
- **Department**: Computer Science
- **Permissions**:
  - Connect with students
  - Share career experience
  - Provide mentorship
  - View placement opportunities
  - Help with job matching

---

## 🎯 Testing Workflows

### **Workflow 1: Student Assignment Submission**
1. Login as: `student@campushub.edu` / `student123`
2. Navigate to **Assignments**
3. Click on an assignment
4. Upload a file
5. View submission status

### **Workflow 2: Faculty Grading & Plagiarism Check**
1. Login as: `faculty@campus.edu` / `password123`
2. Go to **Submissions**
3. Select a student submission
4. Run **Plagiarism Check**
5. Add grades & feedback

### **Workflow 3: Attendance Prediction**
1. Login as: `faculty@campus.edu` / `password123`
2. Navigate to **Risk Assessment**
3. Select a student
4. View 4-week attendance forecast
5. See intervention recommendations

### **Workflow 4: Job Recommendations (AI)**
1. Login as: `student@campushub.edu` / `student123`
2. Go to **Placements > Jobs**
3. View AI-recommended jobs
4. See match scores & skill analysis
5. Apply for a job

### **Workflow 5: Placement Coordinator**
1. Login as: `coordinator@campus.edu` / `password123`
2. View **Dashboard**
3. Create new job posting
4. Schedule interviews
5. Track applications

### **Workflow 6: AI Chatbot**
1. Login as any user
2. Go to **Chatbot** (Student) or messaging
3. Ask questions like:
   - "How do I submit assignments?"
   - "What's my attendance status?"
   - "Help me prepare for interviews"
4. Get AI-powered responses

### **Workflow 7: Messaging/Chat**
1. Login as: `student@campushub.edu` / `student123`
2. Go to **Messages**
3. Search for another user (e.g., Faculty, Alumni)
4. Start a conversation
5. Send and receive messages

---

## 🔧 Database & Seeding

### Run Seed Script (if needed)
```bash
cd backend
node seed.js
```

This will:
- Create all test users
- Set up sample assignments (with deadlines)
- Create job postings
- Add interview schedules
- Create announcements
- Generate sample attendance records

### Seeded Data Includes:
- ✅ 5 test users (all roles)
- ✅ 2 sample assignments
- ✅ 2 job postings
- ✅ 1 placement announcement
- ✅ 1 interview schedule
- ✅ Sample attendance patterns

---

## 🚀 Features to Test

### AI-Powered Features
- ✅ **AI Chatbot**: Answers questions with fallback knowledge base
- ✅ **Plagiarism Detection**: Analyzes text similarity
- ✅ **Attendance Prediction**: 4-week forecast with risk assessment
- ✅ **Job Matching**: Skill-based recommendations with match scores
- ✅ **Risk Assessment**: Identifies at-risk students

### Core Features
- ✅ **Assignments**: Create, submit, grade
- ✅ **Attendance**: Mark, track, predict
- ✅ **Placements**: Post jobs, apply, track
- ✅ **Messaging**: Chat with any user
- ✅ **Grades**: View scores & feedback
- ✅ **Analytics**: Dashboard insights
- ✅ **Events**: Register & manage

---

## 📱 Account Quick Copy (for convenience)

### Student (Easy Password)
```
Email: student@campushub.edu
Password: student123
```

### Faculty
```
Email: faculty@campus.edu
Password: password123
```

### Admin
```
Email: admin@campushub.edu
Password: admin123
```

### Coordinator
```
Email: coordinator@campus.edu
Password: password123
```

### Alumni
```
Email: alumni@campushub.edu
Password: password123
```

---

## 🆘 Troubleshooting

### Can't Login?
1. Make sure backend is running: `npm run dev` in `backend` folder
2. MongoDB should be running locally
3. Check the credentials are typed correctly
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Data Not Showing?
1. Run seed script: `node seed.js`
2. Refresh the page
3. Check if you're logged in as the correct role

### AI Features Not Working?
- **Chatbot**: Will use local knowledge base automatically
- **Plagiarism**: Works offline with string similarity
- **Predictions**: Uses local algorithms, no external API needed
- **Job Matching**: Uses keyword matching algorithm

---

## 📊 Testing Metrics

| Feature | Status | How to Test |
|---------|--------|------------|
| Login (all roles) | ✅ | Use any credential above |
| Student Dashboard | ✅ | Login as student |
| Faculty Grading | ✅ | Login as faculty, go to Submissions |
| AI Predictions | ✅ | Faculty > Risk Assessment |
| Job Matching | ✅ | Student > Placements > Jobs (AI Recommendations) |
| Plagiarism Check | ✅ | Faculty > Submit assignment, run plagiarism check |
| Messaging | ✅ | Go to Messages, search for user |
| Chatbot | ✅ | Student > Chatbot |

---

## 🎓 What Each Role Can Experience

### Student Journey
1. View courses & materials
2. Submit assignments
3. Check grades & feedback
4. Monitor attendance
5. Get AI recommendations for jobs
6. Use AI tutor for help

7. Connect with alumniZ
8. Chat with facultymongodb+srv://<db_username>:<db_password>@cluster0.pvyr8un.mongodb.net/

### Faculty Journey
1. Create assignments with deadlines
2. Review student submissions
3. Check for plagiarism
4. Grade with feedback
5. Mark attendance
6. View class analytics
7. Identify at-risk students
8. Create events

### Coordinator Journey
1. View job market
2. Post new opportunities
3. Review applications
4. Schedule interviews
5. Match students to jobs
6. Track placements
7. Generate reports

### Admin Journey
1. Manage user accounts
2. Create courses
3. Monitor system
4. View analytics
5. Configure settings
6. Manage backups
7. View security logs

---

## 💡 Pro Tips

- **Copy Credentials**: Click the clipboard icon on test credentials page
- **Test Multiple Roles**: Logout and login as different roles to see different features
- **Try All Features**: Each role has unique permissions and features
- **Real Data**: Seed creates realistic academic data for authentic testing
- **No Setup**: All accounts are pre-configured, just login!

---

**Last Updated**: April 15, 2026  
**Version**: CampusHub 1.0  
**Environment**: Local Development (MongoDB + React + Express)

For more info, check the main README.md in the project root!
