# 🚀 TaskFlow — Team Task Manager

A **production-ready**, full-stack Team Task Manager with role-based access control, Kanban task boards, and real-time statistics.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup/login with bcrypt password hashing
- 👥 **Role-Based Access Control** — Admin and Member roles
- 📁 **Project Management** — Create, assign, and manage projects with team members
- ✅ **Task Kanban Board** — Drag-free status cycling with Todo → In Progress → Done columns
- 📊 **Dashboard Analytics** — Pie charts, task stats, and overdue tracking
- 🔍 **Search & Filter** — Filter tasks by status, priority, due date, and keyword
- ⚡ **Real-time Toast Notifications** — Instant feedback on all actions
- 🎨 **Dark UI** — Professional dark theme with Indigo accent colors

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express 4 |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Charts** | Recharts |
| **Icons** | Heroicons |
| **Dates** | date-fns |
| **Notifications** | react-hot-toast |

---

## 📁 Folder Structure

```
task/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Signup, login, profile
│   │   ├── userController.js   # Admin user CRUD
│   │   ├── projectController.js# Project CRUD + members
│   │   └── taskController.js   # Task CRUD + filters
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + authorize
│   │   ├── validate.js         # express-validator handler
│   │   └── errorHandler.js     # Global error + 404
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Project.js          # Project schema
│   │   └── Task.js             # Task schema (virtuals)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── utils/
│   │   └── seeder.js           # Sample data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js        # Axios instance + interceptors
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── UI/
│   │   │       ├── Button.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Spinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Projects/
│   │   │   │   ├── ProjectList.jsx
│   │   │   │   └── ProjectDetail.jsx
│   │   │   ├── Tasks/
│   │   │   │   └── MyTasks.jsx
│   │   │   └── Admin/
│   │   │       └── UserManagement.jsx
│   │   ├── App.jsx             # Router config
│   │   ├── main.jsx
│   │   └── index.css           # Global styles + Tailwind
│   ├── .env.example
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── API_DOCS.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd task
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev      # requires nodemon: npm install -g nodemon
# OR
npm start        # production mode
```

#### (Optional) Seed sample data
```bash
npm run seed
```
This creates:
- **Admin**: `admin@taskmanager.com` / `Admin@123`
- **Member 1**: `bob@taskmanager.com` / `Member@123`
- **Member 2**: `carol@taskmanager.com` / `Member@123`
- 2 sample projects with 6 tasks

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open: **http://localhost:5173**

---

## 🌐 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with read/write access
4. Whitelist IP: `0.0.0.0/0` (or your Railway IP)
5. Get connection string: **Connect → Drivers → Node.js**
6. Replace `<username>`, `<password>` in `.env`

---

## 🚂 Railway Deployment (Backend)

### Step 1: Install Railway CLI (optional)
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Deploy via GitHub (Recommended)
1. Push your `backend/` code to GitHub
2. Go to [Railway.app](https://railway.app) → **New Project**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Set the **Root Directory** to `/backend`

### Step 3: Configure Environment Variables on Railway
In Railway Dashboard → Your Service → **Variables**, add:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.vercel.app
PORT=5000
```

### Step 4: Set Start Command
Railway auto-detects `npm start`. Your `package.json` already has:
```json
"scripts": { "start": "node server.js" }
```

### Step 5: Get Your API URL
Railway gives you a URL like: `https://task-backend-production.up.railway.app`

---

## 🌍 Vercel Deployment (Frontend)

### Step 1: Update environment variable
In `frontend/.env` (or Vercel dashboard):
```env
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

### Step 2: Deploy to Vercel
```bash
cd frontend
npm install -g vercel
vercel
```
Follow the prompts, set `VITE_API_URL` in Vercel's Environment Variables.

**OR** connect GitHub to Vercel and set env vars in the dashboard.

---

## 🔑 Role Permissions

| Feature | Admin | Member |
|---------|-------|--------|
| Create/delete projects | ✅ | ❌ |
| View own projects | ✅ | ✅ |
| Create/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (assigned only) |
| Manage members | ✅ | ❌ |
| User management | ✅ | ❌ |
| Dashboard | ✅ | ✅ |

> 💡 **First user** to sign up automatically becomes **Admin**.

---

## 🔗 API Documentation

See [`API_DOCS.md`](./API_DOCS.md) for complete endpoint reference.

---

## 🎬 Demo Script (2–5 min)

1. **Open** the app at `http://localhost:5173`
2. **Show Login page** → Click "Admin Demo" to fill credentials → Login
3. **Dashboard** → Show stat cards (Total Tasks, Completed, Overdue, In Progress) + Pie Chart
4. **Projects page** → Show project cards with member avatars and task counts
5. **Create project** → Click "New Project", fill name, pick color, add members
6. **Project Detail (Kanban)** → Show 3 columns (Todo / In Progress / Done)
7. **Create a task** → Fill title, description, priority, due date, assignee
8. **Update task status** → Click circle checkbox to cycle through statuses
9. **My Tasks page** → Show filter by status/priority/overdue toggle
10. **Admin → Users** → Show user table with roles, edit a user role, show deactivation
11. **Logout** → Login as Member → Show restricted view (no admin features)
12. **Show Signup** → First user = auto admin note

---

## 📬 Health Check

```
GET https://your-backend.railway.app/health
```
Returns: `{ "status": "ok", "timestamp": "...", "environment": "production" }`
