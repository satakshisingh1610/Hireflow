# HireFlow — Full Stack Job Portal

A production-ready MERN stack job portal with role-based auth, job posting, applications with resume upload, saved jobs, and dashboards for both seekers and recruiters.

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios               |
| Backend   | Node.js, Express.js                               |
| Database  | MongoDB (Mongoose ODM)                            |
| Auth      | JWT (access + refresh tokens, httpOnly cookies)   |
| Upload    | Multer (local disk storage)                       |
| Deploy    | Vercel (frontend) · Render (backend) · Atlas (DB) |

---

## Quick Start (Local)

### 1. Clone / unzip the project

```bash
cd hireflow
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your MongoDB URI and JWT secrets (see below)
npm run dev
# → Running on http://localhost:5000
```

### 3. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hireflow
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ACCESS_TOKEN_SECRET=<64-char-hex>
REFRESH_TOKEN_SECRET=<different-64-char-hex>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

### Frontend (`frontend/.env`) — production only

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

> In development, Vite's proxy handles `/api` → `localhost:5000` automatically. No `.env` needed locally.

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path       | Auth    | Description                    |
|--------|------------|---------|--------------------------------|
| POST   | /signup    | —       | Register (seeker or recruiter) |
| POST   | /login     | —       | Login, returns access token    |
| POST   | /refresh   | cookie  | Rotate token pair              |
| POST   | /logout    | cookie  | Invalidate session             |
| GET    | /me        | Bearer  | Get current user               |

### Jobs — `/api/jobs`
| Method | Path  | Auth      | Description           |
|--------|-------|-----------|-----------------------|
| GET    | /     | —         | List / search / filter |
| GET    | /my   | Recruiter | Own posted jobs       |
| GET    | /:id  | —         | Job detail            |
| POST   | /     | Recruiter | Create job            |
| PUT    | /:id  | Recruiter | Update own job        |
| DELETE | /:id  | Recruiter | Delete own job        |

### Applications — `/api/applications`
| Method | Path              | Auth      | Description              |
|--------|-------------------|-----------|--------------------------|
| POST   | /apply            | Seeker    | Apply (multipart/form-data) |
| GET    | /my               | Seeker    | My applications          |
| GET    | /job/:jobId       | Recruiter | Applicants for a job     |
| PATCH  | /:id/status       | Recruiter | Update applicant status  |

### Users — `/api/users`
| Method | Path              | Auth    | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /profile          | Any     | Get profile           |
| PUT    | /profile          | Any     | Update profile        |
| POST   | /upload-resume    | Seeker  | Upload resume file    |
| POST   | /save-job/:jobId  | Seeker  | Toggle save/unsave    |
| GET    | /saved-jobs       | Seeker  | Get saved jobs        |

---

## Deployment

### MongoDB Atlas
1. Create cluster at https://cloud.mongodb.com
2. Network Access → Add `0.0.0.0/0`
3. Copy connection string → set as `MONGODB_URI` in Render

### Backend → Render
1. Push to GitHub
2. Render → New Web Service → connect repo
3. Root dir: `backend` · Build: `npm install` · Start: `npm start`
4. Set all env vars from `backend/.env.example`
5. Your API: `https://hireflow-api.onrender.com`

### Frontend → Vercel
1. Vercel → New Project → import repo
2. Root dir: `frontend` · Framework: Vite
3. Env var: `VITE_API_URL=https://hireflow-api.onrender.com/api`
4. Deploy

### Wire CORS
In Render, set `CLIENT_URL=https://your-app.vercel.app`, then redeploy backend.

---

## Zip the project

```bash
zip -r hireflow.zip hireflow/ \
  --exclude "*/node_modules/*" \
  --exclude "*/.env" \
  --exclude "*/uploads/resumes/*"
```
