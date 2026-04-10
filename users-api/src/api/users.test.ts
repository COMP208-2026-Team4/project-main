/**
 * Integration tests for /users routes.
 * Uses Node's built-in test runner (same pattern as sessions-api).
 *
 * Run:  npm test
 *
 * Note: These tests require a running database (set DATABASE_URL in .env).
 * For CI, use a test-specific database or mock prisma via the resolvers module.
 */
import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert/strict";

// ── Stub Prisma before any route imports ────────────────────────────────────
const fakeUsers: Record<string, any> = {};

const allUsers = () => Object.values(fakeUsers) as any[];

const prismaStub = {
  user: {
    findUnique: async ({ where }: any) => {
      if (where.id) return fakeUsers[where.id] ?? null;
      if (where.email) return allUsers().find((u) => u.email === where.email) ?? null;
      if (where.username) return allUsers().find((u) => u.username === where.username) ?? null;
      return null;
    },
    findMany: async ({ where }: any) => {
      const orClauses = where?.OR;
      if (!Array.isArray(orClauses)) return [];

      const allowedUsernames = new Set<string>();
      for (const clause of orClauses) {
        const username = clause?.username;
        if (typeof username === "string") allowedUsernames.add(username);
      }

      return allUsers().filter((u) => allowedUsernames.has(u.username));
    },
    create: async ({ data }: any) => {
      if (Object.values(fakeUsers).some((u) => u.email === data.email))
        throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
      fakeUsers[data.id] = data;
      return data;
    },
    update: async ({ where, data }: any) => {
      if (!fakeUsers[where.id])
        throw Object.assign(new Error("Not found"), { code: "P2025" });
      fakeUsers[where.id] = { ...fakeUsers[where.id], ...data };
      return fakeUsers[where.id];
    },
  },
};

// Patch the resolvers module
mock.module("../resolvers", { namedExports: { prisma: prismaStub } });

// ── Now import app dependencies ──────────────────────────────────────────────
// We build a minimal Express app for testing
import express from "express";
import usersRouter from "./users";
import oauthRouter from "./oauth";

process.env.JWT_SECRET = "test-secret-32-chars-long-enough!!";
process.env.JWT_EXPIRY = "1h";
process.env.FRONTEND_URL = "http://localhost:5173";

import { signToken } from "../middleware/auth";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);
app.use("/auth", oauthRouter);

// Simple in-process HTTP test helper using node:http
import http from "node:http";

let server: http.Server;
let baseUrl: string;

function request(
  method: string,
  path: string,
  body?: object,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
      method,
      path,
      hostname: "127.0.0.1",
      port: (server.address() as any).port,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          body: data ? JSON.parse(data) : null,
        });
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

before(async () => {
  server = http.createServer(app);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  baseUrl = `http://127.0.0.1:${(server.address() as any).port}`;
});

after(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

// ── POST /users ──────────────────────────────────────────────────────────────
describe("POST /users", () => {
  it("creates a user with valid data", async () => {
    const res = await request("POST", "/users", {
      email: "alice@example.com",
      username: "alice",
      password: "securePass1",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.email, "alice@example.com");
    assert.equal(res.body.username, "alice");
    assert.ok(!res.body.password, "password hash must not be exposed");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request("POST", "/users", { email: "bob@example.com" });
    assert.equal(res.status, 400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request("POST", "/users", {
      email: "short@example.com",
      username: "shortpw",
      password: "abc",
    });
    assert.equal(res.status, 400);
  });

  it("returns 409 on duplicate email", async () => {
    const res = await request("POST", "/users", {
      email: "alice@example.com",
      username: "alice2",
      password: "anotherPass1",
    });
    assert.equal(res.status, 409);
  });
});

// ── GET /users/me ────────────────────────────────────────────────────────────
describe("GET /users/me", () => {
  it("returns 401 with no token", async () => {
    const res = await request("GET", "/users/me");
    assert.equal(res.status, 401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request("GET", "/users/me", undefined, "bad.token.here");
    assert.equal(res.status, 401);
  });

  it("returns the authenticated user's profile", async () => {
    // Get alice's ID from the fake store
    const alice = Object.values(fakeUsers).find(
      (u) => u.email === "alice@example.com"
    )!;
    // Patch findUnique to also work by id
    (prismaStub.user.findUnique as any) = async ({ where }: any) =>
      fakeUsers[where.id] ?? Object.values(fakeUsers).find((u) => u.email === where.email) ?? null;

    const token = signToken({
      sub: alice.id,
      email: alice.email,
      username: alice.username,
    });
    const res = await request("GET", "/users/me", undefined, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.email, "alice@example.com");
    assert.ok(!res.body.password);
  });
});

// ── GET /users/:username ─────────────────────────────────────────────────────
describe("GET /users/:username", () => {
  it("returns a public profile by username", async () => {
    const res = await request("GET", "/users/alice");
    assert.equal(res.status, 200);
    assert.equal(res.body.username, "alice");
    assert.ok(!res.body.password);
    assert.ok(!res.body.email);
  });

  it("matches usernames case-insensitively", async () => {
    const res = await request("GET", "/users/ALICE");
    assert.equal(res.status, 200);
    assert.equal(res.body.username, "alice");
  });

  it("returns 404 when user does not exist", async () => {
    const res = await request("GET", "/users/does-not-exist");
    assert.equal(res.status, 404);
  });
});

// ── PUT /users/:id ───────────────────────────────────────────────────────────
describe("PUT /users/:id", () => {
  it("returns 401 without token", async () => {
    const res = await request("PUT", "/users/someId", { username: "new" });
    assert.equal(res.status, 401);
  });

  it("returns 403 when updating another user's profile", async () => {
    const token = signToken({
      sub: "other-id",
      email: "other@example.com",
      username: "other",
    });
    const alice = Object.values(fakeUsers).find(
      (u) => u.email === "alice@example.com"
    )!;
    const res = await request("PUT", `/users/${alice.id}`, { username: "hacker" }, token);
    assert.equal(res.status, 403);
  });

  it("updates own profile", async () => {
    const alice = Object.values(fakeUsers).find(
      (u) => u.email === "alice@example.com"
    )!;
    const token = signToken({
      sub: alice.id,
      email: alice.email,
      username: alice.username,
    });
    const res = await request("PUT", `/users/${alice.id}`, { username: "alice_updated" }, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.username, "alice_updated");
  });
});

// ── Auth middleware ──────────────────────────────────────────────────────────
describe("Auth middleware", () => {
  it("rejects a missing Authorization header", async () => {
    const res = await request("GET", "/users/me");
    assert.equal(res.status, 401);
    assert.match(res.body.error, /Missing or malformed/);
  });

  it("rejects a Bearer token with wrong secret", async () => {
    // sign with a different secret
    import("jsonwebtoken").then(({ default: jwt }) => {
      const badToken = jwt.sign({ sub: "x", email: "x@x.com", username: "x" }, "wrong-secret");
      return request("GET", "/users/me", undefined, badToken);
    }).then((res) => {
      assert.equal((res as any).status, 401);
    });
  });
});
