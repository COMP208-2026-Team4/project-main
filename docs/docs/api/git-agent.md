# Git Agent

The `git-agent` is a Rust microservice responsible for Git repository operations. It wraps the Git CLI and exposes a JSON HTTP API. It runs on port **6025**.

Read endpoints on **public** repositories allow unauthenticated access. Private repositories require a valid JWT from the owner or a collaborator. Write endpoints always require a JWT.

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

### `GET /repositories/profile/{owner}`

List all repositories visible to the caller for a given user profile. Public repos are always shown; private repos only appear if the caller is the owner.

**Response `200`:** Array of repo objects with `name`, `owner`, `visibility`, `description`, `star_count`, `last_commit_timestamp`.

---

### `GET /repositories/{owner}/{repo}/meta`

Get metadata for a repository (visibility, description, stars, collaborators). Respects visibility: public repos accessible without auth.

**Response `200`:**
```json
{
  "visibility": "public",
  "description": "A cool project",
  "star_count": 5,
  "starred_by_me": true,
  "collaborators": ["user_id_1"],
  "created_at": "2026-04-13T00:00:00Z",
  "updated_at": "2026-04-13T00:00:00Z"
}
```

---

### `PUT /repositories/{owner}/{repo}/settings`

Update repository visibility and/or description. **Owner only.**

**Request body:**
```json
{ "visibility": "private", "description": "Updated description" }
```

---

### `POST /repositories/{owner}/{repo}/star`

Star a repository. Requires authentication.

**Response `200`:** `{ "starred": true, "star_count": 6 }`

### `DELETE /repositories/{owner}/{repo}/star`

Unstar a repository. Requires authentication.

---

### `POST /repositories/{owner}/{repo}/collaborators`

Add a collaborator. **Owner only.**

**Request body:** `{ "user_id": "1234567890" }`

### `DELETE /repositories/{owner}/{repo}/collaborators/{user_id}`

Remove a collaborator. **Owner only.**

---

### `GET /search?q=...&type=repo|commit&limit=20`

Search across all public repositories for repo names and commit messages. Supports optional `type` filter.

**Response `200`:**
```json
{
  "results": [
    { "type": "repo", "owner": "...", "name": "...", "description": "..." },
    { "type": "commit", "owner": "...", "repo": "...", "sha": "...", "message": "..." }
  ]
}
```

---

### `GET /repositories/{owner}/{repo}/commits/{sha}/preview`

Preview the state of a commit: tree listing, diff, and containing branches. Useful for branch exploration without checkout.

**Response `200`:** Object with `sha`, `author_name`, `message`, `branches`, `diff_stat`, `diff`, `tree`.

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

Each repository also has a **metadata sidecar file** stored alongside:

```
$REPOS_DIR/
└── <user_id>/
    ├── <repo_name>.git/
    └── <repo_name>.meta.json    # visibility, stars, collaborators
```

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
