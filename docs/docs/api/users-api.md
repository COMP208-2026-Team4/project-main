# Users API

The `users-api` microservice handles user identity — registration, profile management, and Google OAuth2 sign-in. It runs on port **6024**.

All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

## Endpoints

### `POST /users`

Create a new user account with email/password credentials.

**Public** — no JWT required.

**Request body:**
```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "securePass1"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Must be unique |
| `username` | string | yes | Must be unique |
| `password` | string | yes | Minimum 8 characters; stored as bcrypt hash |

**Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| `201` | `User` object (no password field) | Created |
| `400` | `{ error }` | Missing fields or password too short |
| `409` | `{ error }` | Email or username already taken |

---

### `GET /users/me`

Returns the profile of the authenticated user.

**Protected** — requires JWT.

**Response `200`:**
```json
{
  "id": "1234567890123456789",
  "email": "alice@example.com",
  "username": "alice",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "createdAt": "2026-02-10T12:00:00.000Z",
  "updatedAt": "2026-02-10T12:00:00.000Z"
}
```

The `password` field is **never** included in any response.

---

### `PUT /users/:id`

Update the authenticated user's own profile.

**Protected** — requires JWT. The `:id` in the URL must match the `sub` claim of the JWT.

**Request body (all fields optional, at least one required):**
```json
{
  "username": "alice_new",
  "avatarUrl": "https://cdn.example.com/my-avatar.png"
}
```

**Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| `200` | Updated `User` object | Success |
| `400` | `{ error }` | No fields provided |
| `401` | `{ error }` | Missing/invalid JWT |
| `403` | `{ error }` | Attempting to update another user's profile |
| `404` | `{ error }` | User not found |

---

### `GET /auth/google`

Redirects to Google's OAuth2 consent screen. See [Auth Flow](./auth-flow.md) for the full sequence.

**Public** — no JWT required.

---

### `GET /auth/google/callback`

OAuth2 callback endpoint called by Google. Issues a JWT and redirects to the frontend.

**Public** — no JWT required.

---

## Data Model

```prisma
model User {
  id        String   @id @unique   // Snowflake ID
  email     String   @unique
  username  String   @unique
  password  String?                // null for OAuth-only accounts
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port to listen on | `6024` |
| `DATABASE_URL` | MariaDB connection string | `mysql://root:password@localhost:3307/users` |
| `JWT_SECRET` | Shared HMAC secret | `change-me-to-a-long-random-secret` |
| `JWT_EXPIRY` | Token lifetime | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Registered callback URI | `http://localhost:6024/auth/google/callback` |
| `FRONTEND_URL` | Frontend base URL (for post-OAuth redirect) | `http://localhost:5173` |

---

## Running Locally

```bash
cd users-api
cp .env.example .env
# fill in your Google OAuth credentials and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev
```

## Running Tests

```bash
npm test
```

Tests use Node's built-in test runner and mock Prisma — no database required.
