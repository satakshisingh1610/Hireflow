# HireFlow — Full Stack Job Portal 🚀

A production-ready MERN stack job portal with role-based authentication, job posting, applications with resume upload, saved jobs, and dashboards for both job seekers and recruiters.

---

## 🌐 Live Demo

* 🔗 **Frontend (Vercel):** https://hireflow-nfky.vercel.app
* 🔗 **Backend API (Render):** https://hireflow-lyxe.onrender.com

---

## 🛠️ Tech Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, Axios               |
| Backend  | Node.js, Express.js                               |
| Database | MongoDB (Mongoose ODM)                            |
| Auth     | JWT (access + refresh tokens, httpOnly cookies)   |
| Upload   | Multer (local disk storage)                       |
| Deploy   | Vercel (frontend) · Render (backend) · Atlas (DB) |

---

## ⚡ Quick Start (Local)

### 1. Clone the project

```bash
cd hireflow
```

---

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hireflow
NODE_ENV=development
CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=<64-char-hex>
REFRESH_TOKEN_SECRET=<64-char-hex>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://hireflow-lyxe.onrender.com/api
```

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description      |
| ------ | -------- | ---------------- |
| POST   | /signup  | Register user    |
| POST   | /login   | Login user       |
| POST   | /refresh | Refresh token    |
| POST   | /logout  | Logout user      |
| GET    | /me      | Get current user |

---

### Jobs — `/api/jobs`

| Method | Endpoint | Description    |
| ------ | -------- | -------------- |
| GET    | /        | Get all jobs   |
| GET    | /my      | Recruiter jobs |
| POST   | /        | Create job     |
| PUT    | /:id     | Update job     |
| DELETE | /:id     | Delete job     |

---

### Applications — `/api/applications`

| Method | Endpoint    | Description            |
| ------ | ----------- | ---------------------- |
| POST   | /apply      | Apply to job           |
| GET    | /my         | My applications        |
| GET    | /job/:jobId | Applicants (recruiter) |

---

### Users — `/api/users`

| Method | Endpoint         | Description    |
| ------ | ---------------- | -------------- |
| GET    | /profile         | Get profile    |
| PUT    | /profile         | Update profile |
| POST   | /upload-resume   | Upload resume  |
| POST   | /save-job/:jobId | Save job       |
| GET    | /saved-jobs      | Saved jobs     |

---

## ☁️ Deployment

### 🔹 MongoDB Atlas

* Create cluster
* Allow `0.0.0.0/0` access
* Use connection string in backend

---

### 🔹 Backend → Render

* Root: `backend`
* Build: `npm install`
* Start: `npm start`
* Add environment variables

---

### 🔹 Frontend → Vercel

* Root: `frontend`
* Framework: Vite
* Add env:

```env
VITE_API_URL=https://hireflow-lyxe.onrender.com/api
```

---

## 🔗 System Architecture

```
Frontend (Vercel)
   ↓
Backend API (Render)
   ↓
MongoDB Atlas
```

---

## 💼 Features

* 🔐 Secure JWT Authentication
* 👤 Role-based access (Seeker / Recruiter)
* 📄 Resume upload & job applications
* 🔎 Job search & filtering
* ⭐ Saved jobs
* 📊 Dashboard for users

---

## 🧠 Author

**Satakshi Singh**
Full Stack Developer

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
