# Deployment Guide: Railway.app

I have configured your project for a **Unified Deployment** on Railway. This means the backend will serve your React frontend, simplifying the setup to a single Railway service.

## Changes Made
1.  **Modified `backend/server.js`**: Added logic to serve the static frontend files (`frontend/dist`) when `NODE_ENV=production`.
2.  **Created Root `package.json`**: Added scripts to install dependencies for both folders and build the frontend from the root.
3.  **Created `Procfile`**: Explicitly tells Railway how to start the production server.

## Deployment Steps

### 1. Connect to Railway
- Go to [Railway.app](https://railway.app/) and log in.
- Click **"New Project"** -> **"Deploy from GitHub repo"**.
- Select your repository.

### 2. Configure Environment Variables
In the Railway dashboard, go to the **Variables** tab of your service and add the following:

| Variable | Recommended Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Connection String |
| `JWT_SECRET` | A long random string |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | Your Railway App URL (e.g., `https://your-app.up.railway.app`) |

> [!NOTE]
> Railway automatically provides the `PORT` variable, so you don't need to set it manually.

### 3. Verify Build Settings
Railway should automatically detect the root `package.json`. Ensure the following settings (usually default):
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (or it will use the `Procfile`)

## Local Testing
To test the production build locally:
1. Run `npm run build` from the root.
2. Run `npm start` from the root.
3. Visit `http://localhost:5000`.
