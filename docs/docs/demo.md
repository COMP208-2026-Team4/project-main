---
sidebar_position: 1
---

# Demo Guide

A quick walkthrough for getting started with Cone.

---

## Prerequisites

All services must be running before you begin. See each service's README for setup instructions.

### Quick Setup (PM2)

From the root directory, start all services at once:

```bash
pm2 start ecosystem.config.js
```

To stop all services:

```bash
pm2 stop ecosystem.config.js
```

### Manual Setup

| Service | Command | URL |
|---------|---------|-----|
| `rest-api` | `npm run dev` | `http://localhost:3000` |
| `users-api` | `npm run dev` | `http://localhost:6024` |
| `sessions-api` | `npm run dev` | `http://localhost:6023` |
| `git-agent` | `cargo run` | `http://localhost:6025` |
| `frontend` | `npm run dev` | `http://localhost:5173` |
| `docs` | `npm run dev` | `http://localhost:6054` |

---

## Step 1 - Sign in with Google

1. Open `http://localhost:5173` in your browser.
2. You will see the Cone landing page.
3. Click **Sign in with Google**.
4. Select your Google account and approve access.
5. You are redirected back to the app and land on your **Dashboard**.

---

## Step 2 - Explore the Dashboard

- Your username appears in the welcome heading.
- The sidebar on the left lets you navigate to your repositories, tickets, and focus sessions.
- The **+ New Repository** button (top right of the main area) opens the repository creation form.

---

## Step 3 - Create a Repository

1. Click **+ New Repository** on the Dashboard.
2. Enter a repository name (letters, numbers, dashes, dots, underscores only).
3. Click **Create**.
4. The new repository appears in your list.

---

## Step 4 - Navigate the Repository

1. Click the repository name to open it.
2. From the sidebar you can switch between:
   - **Code** - browse files and commits
   - **Tickets** - manage issues and tasks (Kanban or table view)
   - **Timer** - start a focus session tied to this repository

---

## Step 5 - Start a Focus Session

1. Navigate to a repository's **Timer** tab.
2. Set your session duration.
3. Click **Start**.
4. Work! The timer counts down.
5. Click **End session** to save it early, or let it complete naturally.
6. Your session is saved and visible in your productivity graph.

---

## Signing Out

Click your avatar in the top-right corner of the Navbar and select **Sign out**. Your session token is cleared from the browser.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page after OAuth | Check that `FRONTEND_URL` in `users-api/.env` matches the frontend address |
| "Bad Gateway" error | Make sure all backend services are running |
| Repository creation fails | Ensure `git` is installed and `REPOS_DIR` is writable |
| "Invalid token" errors | Make sure `JWT_SECRET` is identical in all `.env` files |
