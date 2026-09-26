# JuniorConnect — Production-Ready Junior–Senior Student Mentoring Platform

JuniorConnect bridges the gap between university freshmen/sophomores (juniors) and experienced 3rd/4th-year students (seniors) within the same college or university. It enables peer mentorship, verified senior discovery, real-time connection requests and chat, StackOverflow-style Q&A discussions, and a high-yield academic repository (PYQs, interview roadmaps, notes).

---

## 🚀 Live Preview & Architecture

* **Live Web Runtime**: Built with **React 19, TypeScript, Material 3 Design tokens, and Tailwind CSS**.
* **Mobile Ready**: Architecture modeled after **Clean Architecture** with separation of Domain entities, Repositories, Providers, and Presentation layers ready for Flutter / Mobile compilation.
* **Backend Database & Security**: Real-time **Google Cloud Firestore & Firebase Auth** provisioned and secured with granular rules (`firestore.rules`).

---

## 🛠️ Key Capabilities & Features

### 1. Secure Authentication & Onboarding
* **Role-Based Profiles**: Differentiates between **Junior (Mentee)** and **Senior (Mentor)** with academic validation (College, Course, Department, Graduation Year, Skills).
* **Profile Management**: Senior profiles feature technical skills, past internships (e.g. Google, Microsoft, Meta), achievements, star ratings, and availability slots.

### 2. Powerful Senior Discovery Engine
* Multi-attribute filtering by:
  * University / College
  * Department & Course
  * Academic Year (3rd vs 4th Year)
  * Minimum Star Rating (4.5+ ★)
  * Freeform full-text search across skills (DSA, Flutter, React, System Design)

### 3. Connection Pipeline & Real-Time Chat
* **Connection System**: Juniors send connection requests with customizable intro notes; seniors can accept or decline.
* **Real-Time Messaging**: Bidirectional sub-second chat powered by Firestore listeners with attachment sharing, message status, and participant isolation.

### 4. StackOverflow-Style Q&A
* Categorized university academic doubts (Programming, DSA, DBMS, OS, Placements, Exams).
* Upvoting system with anti-spam protections.
* Mark answers as **Verified / Accepted Solution**.

### 5. High-Yield Academic Vault (Notes & PYQs)
* Share and download verified semester notes, cheat sheets, and previous year question papers.
* Download tracking and categorized filtering.

### 6. 1-on-1 Mentorship Booking & Reviews
* Juniors select meeting topic, date, and preferred slot.
* Automatic video meeting room assignment (Google Meet integration).
* Post-session 5-star ratings and written reviews which automatically update mentor aggregate ratings.

### 7. Admin Moderation Console
* Review flagged student reports for academic integrity or harassment.
* Grant **Verified Mentor** badges to seniors.
* Manage suspensions to protect university students.

---

## 🔒 Security Rules
The application deploys strict rules in `firestore.rules`:
* Profiles can only be mutated by their owner.
* Chat messages can only be read and written by users inside `chat.participants`.
* Non-admin users cannot alter verification or suspension statuses.

---

## 📁 Repository Structure

```text
src/
├── core/
│   └── constants.ts          # Colleges, Departments, Courses, Skills
├── context/
│   └── AuthContext.tsx       # Auth provider, notifications, role state
├── features/
│   ├── auth/                 # AuthModal.tsx (Login & 3-step onboarding)
│   ├── home/                 # HomeScreen.tsx (Campus dashboard & quick actions)
│   ├── seniors/              # DiscoverSeniors.tsx, SeniorProfileModal.tsx
│   ├── chat/                 # ChatHub.tsx (Real-time threads, requests, files)
│   ├── questions/            # QuestionForum.tsx (Doubts, voting, solutions)
│   ├── resources/            # ResourceLibrary.tsx (Notes, PYQs, downloads)
│   ├── mentorship/           # MentorshipSessionsView.tsx (Booking & reviews)
│   ├── profile/              # StudentProfileView.tsx (ID card & availability)
│   └── admin/                # AdminDashboard.tsx (Moderation & stats)
├── services/
│   ├── firebase.ts           # Firebase SDK initialization
│   ├── authService.ts        # Firebase Authentication methods
│   ├── dataService.ts        # Typed Firestore repositories
│   └── seedData.ts           # Campus seed data generator
└── types/
    └── index.ts              # Domain entities & interfaces
```
