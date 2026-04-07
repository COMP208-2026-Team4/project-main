---
sidebar_position: 1
---

# Auth Flow (JWT + OAuth2)

## Overview

Cone uses **Google OAuth2** for sign-in and **JWT (HS256)** for session management. There are no passwords to remember — Google handles identity verification.

---

## Google OAuth2 Flow

```
Browser                     rest-api (gateway)           users-api                 Google
  │                               │                           │                       │
  │  GET /auth/google             │                           │                       │
  │──────────────────────────────▶│                           │                       │
  │                               │  proxy (public route)     │                       │
  │                               │──────────────────────────▶│                       │
  │                               │                           │  302 → Google consent │
  │◀──────────────────────────────────────────────────────────│──────────────────────▶│
  │                               │                           │                       │
  │  [User approves]              │                           │                       │
  │                               │                           │  GET /auth/google/    │
  │                               │                           │◀──────────────────────│
  │                               │                           │  callback?code=...    │
  │                               │                           │                       │
  │                               │                           │  POST /token          │
  │                               │                           │──────────────────────▶│
  │                               │                           │◀──────────────────────│
  │                               │                           │  { access_token }     │
  │                               │                           │                       │
  │                               │                           │  GET /userinfo        │
  │                               │                           │──────────────────────▶│
  │                               │                           │◀──────────────────────│
  │                               │                           │  { email, name, ... } │
  │                               │                           │                       │
  │                               │                           │  CREATE or FIND User  │
  │                               │                           │  in MariaDB           │
  │                               │                           │                       │
  │                               │                           │  sign JWT             │
  │  302 → /auth/callback?token=  │                           │                       │
  │◀──────────────────────────────────────────────────────────│                       │
  │                               │                           │                       │
  │  store token in localStorage  │                           │                       │
  │  GET /users/me (with JWT)     │                           │                       │
  │──────────────────────────────▶│  validate JWT             │                       │
  │                               │──────────────────────────▶│  validate JWT again   │
  │                               │                           │  return user profile  │
  │◀──────────────────────────────────────────────────────────│                       │
  │  Redux auth state populated   │                           │                       │
  │  Navigate → /dashboard        │                           │                       │
```

---

## JWT Format

All JWTs are signed with **HS256** using the shared `JWT_SECRET`.

**Payload:**
```json
{
  "sub": "1234567890123456789",
  "email": "alice@example.com",
  "username": "alice_1234",
  "iat": 1700000000,
  "exp": 1700604800
}
```

| Field | Description |
|-------|-------------|
| `sub` | Snowflake user ID (primary key in the `users` table) |
| `email` | User's email address (from Google) |
| `username` | Unique username (derived from Google display name) |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expiry (default: 7 days from issue) |

---

## Token Lifecycle

| Event | Action |
|-------|--------|
| Successful OAuth callback | JWT issued by `users-api`, returned to frontend via redirect query param |
| App load (token in localStorage) | Frontend dispatches `fetchMe()` → `GET /users/me` to restore Redux state |
| Token expired or invalid | API returns `401`; frontend should redirect to `/login` |
| User logs out | Token removed from localStorage; Redux auth state cleared |

---

## Zero-Trust Validation

Every service validates the JWT independently:

```
Authorization: Bearer <token>
```

1. Extract the token from the `Authorization` header.
2. Verify the HS256 signature with `JWT_SECRET`.
3. Check `exp` — reject if expired.
4. Use `sub` as the authoritative user identity.

**Never** trust the `x-user-id` / `x-user-email` forwarded headers as the sole source of identity. These are forwarded by the gateway as a convenience after it has already validated the token — downstream services must still re-verify the original `Authorization` header.

---

## Endpoints

### `GET /auth/google`
Redirects the browser to Google's OAuth2 consent screen.

**Public** — no JWT required.

---

### `GET /auth/google/callback`
Called by Google after the user approves access.

**Public** — no JWT required.

**Query params:** `code` (authorization code from Google), `error` (present on denial).

**On success:** Redirects to `FRONTEND_URL/auth/callback?token=<jwt>`.

**On failure:** Redirects to `FRONTEND_URL/login?error=<reason>`.

---

## Environment Variables (users-api)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Shared HMAC secret for signing/verifying JWTs |
| `JWT_EXPIRY` | Token expiry (default `7d`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Must match the URI registered in Google Cloud Console |
| `FRONTEND_URL` | Base URL of the frontend (e.g. `http://localhost:5173`) |
