# Sessions API
- REST API microservice for managing sessions.
- Base path: `/sessions`  
- All requests and responses are JSON.

## Capabilities
- Retrieve a list of all previous sessions, their assessed quality & duration, from the DB.
- Create a new session, & update DB.

## Session Object

```jsonc
{
  "id": "123456789012345678",
  "quality": 4,
  "duration": 30,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

- `id`  
  String. Numeric snowflake identifier.
- `quality`  
  Integer.
- `duration`  
  Integer.
- `createdAt`  
  ISO 8601 timestamp string derived from the snowflake.

---

## GET `/sessions`

Retrieve all recorded sessions, sorted by creation time (newest first).

- **Response 200**
  - Body: JSON array of `Session` objects, sorted by `createdAt` descending.

---

## POST `/sessions`

Create a new session.

- **Headers**
  - `Content-Type: application/json`

- **Body**
  ```json
  {
    "quality": 4,
    "duration": 30
  }
  ```
  - `quality` — required, integer.
  - `duration` — required, integer.

- **Response 201**
  - Body: Persisted `Session` object, including generated snowflake `id` and `createdAt` computed from that `id`.

- **Response 400**
  - Condition: `quality` or `duration` missing or not integers.
  - Body:
    ```json
    { "error": "quality and duration must both be integers" }
    ```

---

## DELETE `/sessions/:id`

Delete a session by its snowflake ID.

- **Path parameters**
  - `id` — required, string of digits representing a snowflake.

- **Response 204**
  - Condition: Session existed and was deleted.

- **Response 400**
  - Condition: `id` is not a valid snowflake string (fails `^\d+$`).
  - Body:
    ```json
    { "error": "id must be a valid snowflake string" }
    ```

- **Response 404**
  - Condition: Valid `id` format, but no session with that `id` exists.
  - Body:
    ```json
    { "error": "session 123456789012345678 not found" }
    ```