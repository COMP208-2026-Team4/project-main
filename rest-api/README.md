# REST API Gateway (Caddy)

This folder now contains a Caddy-based reverse proxy used by Docker Compose.

## Routes

- `/auth*` -> `USERS_API_URL`
- `/users*` -> `USERS_API_URL`
- `/sessions*` -> `SESSIONS_API_URL`
- `/repositories*` -> `GIT_AGENT_URL`
- `/git*` -> `GIT_AGENT_URL`

## CORS

- Allowed origin is controlled by `FRONTEND_URL`.
- Preflight (`OPTIONS`) is handled directly by Caddy.