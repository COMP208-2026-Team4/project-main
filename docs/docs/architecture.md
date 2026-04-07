---
sidebar_position: 2
---

# Architecture

## Overview

Cone is built as a collection of independent microservices behind a single API gateway (`rest-api`). Every service is independently deployable, independently testable, and independently responsible for verifying caller identity.

```mermaid
architecture-beta
    group backend(cloud)[Backend]
    group microservices(server)[Microservices] in backend

    service rest_api(server)[Rest API — Gateway] in backend
    service users(server)[Users API :6024] in microservices
    service git(server)[Git Agent :6025 — Rust] in microservices
    service sessions(server)[Sessions API :6023] in microservices
    service reviews(server)[Review API] in microservices
    service tickets(server)[Tickets API] in microservices

    group db_group(database)[Database] in backend
    service mariadb(database)[MariaDB] in db_group
    service git_storage(database)[Git Repository Storage] in db_group

    service frontend(server)[Frontend :5173]

    frontend:L -- R:rest_api
    rest_api:L -- R:users
    rest_api:L -- R:git
    rest_api:L -- R:sessions
    rest_api:L -- R:reviews
    rest_api:L -- R:tickets
    users:B -- T:mariadb
    sessions:B -- T:mariadb
    git:B -- T:git_storage
```

---

## Zero-Trust Security Model

Cone uses a **zero-trust** approach to service-to-service communication. No service trusts another implicitly.

### How it works

1. **Client** sends a request with an `Authorization: Bearer <jwt>` header.
2. **`rest-api` (gateway)** validates the JWT signature against `JWT_SECRET`.
   - If valid, it adds `x-user-id`, `x-user-email`, `x-user-username` headers and forwards the original `Authorization` header to the upstream microservice.
   - If invalid, it returns `401 Unauthorized` immediately.
3. **Microservices** (`users-api`, `sessions-api`, `git-agent`, …) each independently re-verify the `Authorization: Bearer` header.
   - They do **not** trust the `x-user-*` headers alone — these are informational only.
   - If the JWT is missing or invalid, the microservice returns `401`.

```
Client → [JWT] → rest-api (validates) → [JWT + x-user-*] → microservice (re-validates)
```

### Why zero-trust?

- A compromised internal service cannot forge requests on behalf of another user.
- All services share a single `JWT_SECRET` environment variable but perform independent checks.
- The forwarded `x-user-*` headers are a convenience for logging and filtering — **never** the sole source of truth.

---

## Services

| Service | Port | Language | Responsibilities |
|---------|------|----------|-----------------|
| `rest-api` | 3000 | Node/TS | API gateway, JWT validation, proxying |
| `users-api` | 6024 | Node/TS | User CRUD, Google OAuth2, JWT issuance |
| `sessions-api` | 6023 | Node/TS | Focus session CRUD |
| `git-agent` | 6025 | Rust | Git repository creation, Git CLI wrapper |
| `frontend` | 5173 | React/TS | UI, Redux state, routing |
| `docs` | 3001 | Docusaurus | Documentation site |

---

## Data Flow: Authentication

```
1. User clicks "Sign in with Google" on LandingPage
2. Frontend → GET /auth/google (rest-api → users-api, public route)
3. users-api redirects to Google
4. Google → GET /auth/google/callback?code=...
5. users-api exchanges code → access token → user info
6. users-api creates or retrieves User record in MariaDB
7. users-api issues JWT { sub, email, username }
8. users-api redirects to frontend /auth/callback?token=<jwt>
9. Frontend stores JWT in localStorage, dispatches fetchMe()
10. Frontend → GET /users/me (rest-api validates JWT → users-api validates JWT)
11. Redux auth state populated → user lands on Dashboard
```

---

## Data Flow: Repository Creation

```
1. User clicks "+ New Repository" on Dashboard
2. CreateRepoModal collects repo name
3. Frontend → POST /repositories { name, userId } + Authorization header
4. rest-api validates JWT, forwards to git-agent
5. git-agent re-validates JWT, checks userId matches JWT sub
6. git-agent runs: git init --bare ./repos/<userId>/<name>.git
7. Returns repository metadata { id, name, owner, path, created_at }
```

---

## Database

All services using MariaDB connect via Prisma ORM. Each service has its own schema and migration history — there is no shared schema.

| Service | Database name |
|---------|--------------|
| `users-api` | `users` |
| `sessions-api` | `sessions` |

MariaDB runs on port `3307` (non-standard to avoid conflicts with any local MySQL instance).

---

## Environment Variables

Every service reads its configuration from a `.env` file. Copy `.env.example` and fill in the values before starting.

The **one shared secret** is `JWT_SECRET` — it must be identical across all services.

See individual service docs for their full variable lists.
