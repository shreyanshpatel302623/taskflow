# 🚀 TaskFlow — Team Task Manager

A full-stack MERN application that enables teams to manage projects, assign tasks, and track progress with role-based access control (Admin/Member).

✔ Secure Authentication & Authorization
✔ Project & Task Management
✔ Dashboard & Task Analytics
✔ Fully deployed and production-ready

---

## 🌐 Live Deployment

https://taskflow-production-2a2c.up.railway.app/

---





## ✨ Features

### 🔐 Authentication

* Secure Signup/Login using JWT
* Password hashing with bcrypt
* Role-based access (Admin / Member)

### 👥 Role-Based Access

* Admin: Full control (projects, users, tasks)
* Member: Limited access (assigned tasks only)

### 📁 Project Management

* Create, update, delete projects
* Assign team members

### ✅ Task Management

* Create and assign tasks
* Update status:

  * Todo → In Progress → Done
* Due date tracking

### 📊 Dashboard

* Total tasks
* Completed tasks
* Overdue tasks

### 🔍 Search & Filter

* Filter by status, due date, keyword

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Frontend   | React (Vite) + Tailwind CSS |
| Backend    | Node.js + Express           |
| Database   | MongoDB Atlas               |
| Auth       | JWT + bcrypt                |
| Deployment | Railway + Vercel            |

---

## 📁 Folder Structure

```
taskflow/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── README.md
└── API_DOCS.md
```

---

## ⚙️ Local Setup

### 🔧 Prerequisites

* Node.js v18+
* MongoDB Atlas

---

### 1️⃣ Clone Repo

```
git clone https://github.com/shreyanshpatel302623/taskflow.git
cd taskflow
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

Start backend:

```
npm run dev
```

---

### 3️⃣ Frontend Setup

```
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run:

```
npm run dev
```

---





## 🔗 API Base URL

```
https://taskflow-production-2a2c.up.railway.app/
```

---

## 🧪 Test Credentials

**Admin**

```
admin@taskmanager.com
Admin@123
```

**Member**

```
bob@taskmanager.com
Member@123
```




---

## 🔐 Role Permissions

| Feature         | Admin | Member            |
| --------------- | ----- | ----------------- |
| Create Projects | ✅     | ❌                 |
| View Projects   | ✅     | ✅                 |
| Create Tasks    | ✅     | ❌                 |
| Update Task     | ✅     | ✅ (assigned only) |
| Manage Users    | ✅     | ❌                 |

---
## ⚠️ Troubleshooting

If the deployed backend URL does not open due to DNS issues:

* Try accessing the app using a different network (e.g., mobile hotspot)
* Use a VPN to bypass local DNS restrictions
* Clear your browser cache or open in incognito mode

This issue is related to network/DNS resolution and not the application itself.



---

## 👨‍💻 Author

**Shreyansh Patel**

---

## ⭐ If you like this project

Give it a star on GitHub!
