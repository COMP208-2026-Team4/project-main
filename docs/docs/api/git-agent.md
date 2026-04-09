# Git Agent

The `git-agent` is a Rust microservice responsible for Git repository operations. It wraps the Git CLI and exposes a JSON HTTP API. It runs on port **6025**.

All routes are protected - a valid JWT is required on every request (zero-trust).

---

## Endpoints

### `POST /repositories`

Create a new bare Git repository on the server.

**Protected** - requires JWT. The `user_id` in the body must match the `sub` claim of the JWT.

**Request body:**
```json
{
  "name": "my-awesome-project",
  "user_id": "1234567890123456789"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Letters, numbers, `-`, `_`, `.` only |
| `user_id` | string | yes | Must match the authenticated user's ID |

**Response `201`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-awesome-project",
  "owner": "1234567890123456789",
  "path": "./repos/1234567890123456789/my-awesome-project.git",
  "created_at": "2026-04-04T12:00:00Z"
}
```

**Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| `201` | Repository object | Created |
| `400` | `{ error }` | Invalid or empty name |
| `401` | `{ error }` | Missing/invalid JWT |
| `403` | `{ error }` | `user_id` does not match JWT `sub` |
| `500` | `{ error }` | `git init` failed |

---

### `GET /health`

Returns the service status. Public.

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2026-04-04T12:00:00Z" }
```

---

## Security

The git-agent validates the JWT independently on every request. It does **not** trust the `x-user-id` header forwarded by the gateway - only the verified `sub` claim from the JWT is used as the authoritative user identity.

Additionally, `user_id` in the request body is cross-checked against `sub` to prevent one user from creating repositories under another's namespace.

---

## Repository Storage

Repositories are stored as **bare Git repositories** under `REPOS_DIR`:

```
$REPOS_DIR/
└── <user_id>/
    └── <repo_name>.git/
```

The default `REPOS_DIR` is `./repos` (relative to the working directory).

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to listen on | `6025` |
| `JWT_SECRET` | Shared HMAC secret | - |
| `REPOS_DIR` | Directory for storing bare repositories | `./repos` |

---

## Running Locally

```bash
cd git-agent
cp .env.example .env
# set JWT_SECRET to the same value as other services
cargo run
```

## Running Tests

```bash
cargo test
```

Tests are unit tests that use `actix-web`'s test utilities and mock the Git CLI - no actual Git operations are performed.
