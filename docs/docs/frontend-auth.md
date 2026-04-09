---
sidebar_position: 3
---

# Frontend Authentication

## Overview

The frontend handles authentication using Redux for state management and React Router for protected routing. There are no passwords - sign-in is entirely via Google OAuth2.

---

## Redux Auth State

The `auth` slice in Redux stores the authenticated user:

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  } | null;
  loading: boolean; // true while fetching /users/me on boot
}
```

**Actions:**
- `loginSuccess(user)` - populated after successful `/users/me` fetch
- `logout()` - clears user and removes token from localStorage
- `setLoading(bool)` - controls the boot loading state

**Thunks:**
- `fetchMe()` - dispatches a `GET /users/me` request; used both after OAuth callback and on app boot to restore session

---

## Session Persistence

The JWT is stored in `localStorage` under the key `token`. On every app load, `App.tsx` checks for a stored token and calls `fetchMe()` to restore the Redux state:

```typescript
useEffect(() => {
  if (token()) {
    dispatch(fetchMe());
  }
}, []);
```

If the token is expired or the API returns `401`, the user stays logged out.

---

## Route Structure

| Path | Visibility | Component |
|------|-----------|-----------|
| `/` | Public | `LandingPage` |
| `/login` | Public | `LandingPage` |
| `/auth/callback` | Public | `OAuthCallbackPage` |
| `/dashboard` | Protected | `DashboardPage` |
| `/:userId` | Protected | `UserPage` |
| `/:userId/:repoId/kanban` | Protected | `KanbanPage` |
| `/:userId/:repoId/repo` | Protected | `RepoPage` |
| `/:userId/:repoId/tickets` | Protected | `TicketsPage` |
| `/:userId/:repoId/timer` | Protected | `TimerPage` |

### ProtectedRoute Component

Wraps all authenticated routes. Redirects to `/login` if no user is in Redux state:

```tsx
const ProtectedRoute: React.FC = () => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) return null;              // wait for session restore
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};
```

---

## OAuth Sign-In Flow (Frontend Side)

1. User clicks **Sign in with Google** on `LandingPage`.
2. Browser navigates to `GET /auth/google` on the API gateway.
3. Gateway proxies to `users-api` (public route - no JWT required).
4. `users-api` redirects to Google's consent screen.
5. After approval, Google calls `users-api`'s callback.
6. `users-api` issues a JWT and redirects to `/auth/callback?token=<jwt>`.
7. `OAuthCallbackPage` reads the token, stores it in localStorage, and calls `fetchMe()`.
8. Redux is populated and the user is redirected to `/dashboard`.

---

## Making Authenticated API Requests

All API calls include the JWT via the `getHeaders()` helper:

```typescript
// src/store/utils/rest-headers.ts
export const getHeaders = () => ({
  Authorization: `Bearer ${token()}`,
});
```

The Redux middleware (`src/store/middleware/rest.ts`) automatically sends this header with every `restCallBegan` action.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the REST API gateway | `http://localhost:3000` |
