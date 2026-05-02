# 📚 TaskFlow API Documentation

**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://your-backend.railway.app/api`

**Authentication:** All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Routes

### POST `/auth/signup`
Register a new user.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { "_id": "...", "name": "Jane Doe", "email": "...", "role": "member" }
}
```

---

### POST `/auth/login`
Login with credentials.

**Body:**
```json
{ "email": "jane@example.com", "password": "password123" }
```
**Response (200):**
```json
{ "success": true, "token": "...", "user": { ... } }
```

---

### GET `/auth/me` 🔒
Get current user profile.

---

### PUT `/auth/me` 🔒
Update current user profile.

**Body:** `{ "name": "...", "avatar": "..." }`

---

### PUT `/auth/change-password` 🔒
Change password.

**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## 👥 User Routes (Admin Only)

All routes require: `Authorization: Bearer <token>` + Admin role

### GET `/users`
List all users.

**Query Params:** `search`, `role`, `page`, `limit`

---

### GET `/users/stats`
Get aggregate user stats.

**Response:**
```json
{ "totalUsers": 10, "admins": 2, "members": 8, "activeUsers": 9 }
```

---

### GET `/users/:id`
Get user by ID.

---

### PUT `/users/:id`
Update user.

**Body:** `{ "name", "email", "role", "isActive" }`

---

### DELETE `/users/:id`
Delete user (removes from projects, unassigns tasks).

---

## 📁 Project Routes

### GET `/projects` 🔒
Get projects. Admin sees all, members see assigned.

**Query Params:** `search`, `status`

**Response:**
```json
{
  "data": [{
    "_id": "...",
    "name": "Website Redesign",
    "color": "#6366f1",
    "owner": { "_id": "...", "name": "Alice" },
    "members": [...],
    "taskStats": { "total": 5, "done": 2, "inProgress": 1, "todo": 2 }
  }]
}
```

---

### GET `/projects/:id` 🔒
Get project by ID (with members populated).

---

### POST `/projects` 🔒 Admin
Create a project.

**Body:**
```json
{
  "name": "My Project",
  "description": "Description...",
  "members": ["userId1", "userId2"],
  "color": "#10b981"
}
```

---

### PUT `/projects/:id` 🔒 Admin
Update project.

---

### DELETE `/projects/:id` 🔒 Admin
Delete project and all its tasks.

---

### POST `/projects/:id/members` 🔒 Admin
Add member to project.

**Body:** `{ "userId": "..." }`

---

### DELETE `/projects/:id/members/:userId` 🔒 Admin
Remove member from project.

---

## ✅ Task Routes

### GET `/tasks` 🔒
Get tasks with filters.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `project` | string | Filter by project ID |
| `status` | string | `todo` / `in-progress` / `done` |
| `priority` | string | `low` / `medium` / `high` |
| `assignedTo` | string | User ID or `me` |
| `search` | string | Text search in title/description |
| `overdue` | boolean | `true` to show only overdue |
| `page` | number | Pagination page |
| `limit` | number | Results per page |

---

### GET `/tasks/my-tasks` 🔒
Get all tasks assigned to logged-in user + stats.

**Response:**
```json
{
  "data": {
    "tasks": [...],
    "stats": {
      "total": 8,
      "done": 3,
      "overdue": 1,
      "inProgress": 2,
      "todo": 3
    }
  }
}
```

---

### GET `/tasks/stats` 🔒 Admin
Get global task statistics.

---

### GET `/tasks/:id` 🔒
Get task by ID.

---

### POST `/tasks` 🔒 Admin
Create a task.

**Body:**
```json
{
  "title": "Build API",
  "description": "RESTful endpoints",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-06-01",
  "project": "<projectId>",
  "assignedTo": "<userId>",
  "tags": ["backend", "api"]
}
```

---

### PUT `/tasks/:id` 🔒 Admin or Assigned User
Update task. Only admin can change `assignedTo`.

---

### DELETE `/tasks/:id` 🔒 Admin
Delete task.

---

## 📊 Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

## 🔒 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🏥 Health Check

### GET `/health`
No auth required. Returns server status.

```json
{
  "status": "ok",
  "timestamp": "2026-05-02T06:00:00.000Z",
  "environment": "production"
}
```
