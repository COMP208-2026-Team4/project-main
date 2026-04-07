import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, it } from "node:test";

import dotenv from "dotenv";
import express, { type Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { generateSnowflake } from "../snowflake";

dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is not set");

const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3307,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
});

const prisma = new PrismaClient({ adapter });

let baseUrl = "";
let server: ReturnType<express.Express["listen"]>;

// response we get from the API
type SessionResponse = {
  id: string;
  quality: number;
  duration: number;
  createdAt: string;
};

type ErrorResponse = { error: string };

const apiRequest = async (
  path: string,
  options?: RequestInit
): Promise<Response> => fetch(`${baseUrl}${path}`, options);

// TODO: probably refactor this to a Sessions database wrapper
const createSession = async (data: {
  quality: number;
  duration: number;
}) => prisma.session.create({ data: { id: generateSnowflake(), ...data } });

const assertStatus = (response: Response, expected: number) => {
  assert.equal(response.status, expected);
};

const assertJsonResponse = async <T>(response: Response): Promise<T> => {
  return (await response.json()) as T;
};

describe("REST /sessions integration", () => {
  before(async () => {
    // load rest module:
    const restModule = await import("./rest");
    const restRouter = restModule.default as Router;

    // setup test REST server:
    const app = express();
    app.use("/sessions", restRouter);

    server = app.listen(0);
    await once(server, "listening");

    // get test server address:
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to bind test server to an ephemeral port");
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
    await prisma.$connect();
  });

  beforeEach(async () => await prisma.session.deleteMany());

  after(async () => {
    // cleanup:
    await prisma.session.deleteMany();
    await prisma.$disconnect();

    if (server.listening) {
      server.close();
      await once(server, "close");
    }
  });

  // it -> individual test
  it("GET /sessions returns 200 with empty array when no sessions exist", async () => {
    const response = await apiRequest("/sessions");
    assertStatus(response, 200);

    const body = await assertJsonResponse<unknown>(response);
    assert.deepEqual(body, []);
  });

  it("GET /sessions returns sessions sorted by createdAt descending", async () => {
    const first = await createSession({
      quality: 2,
      duration: 15,
    });

    const second = await createSession({
      quality: 5,
      duration: 45,
    });

    const response = await apiRequest("/sessions");
    assertStatus(response, 200);

    const body = await assertJsonResponse<SessionResponse[]>(response);
    assert.equal(body.length, 2);
    assert.equal(body[0]?.id, second.id);
    assert.equal(body[1]?.id, first.id);
  });

  it("POST /sessions creates a session and returns 201 with persisted record", async () => {
    const response = await apiRequest("/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quality: 4, duration: 30 }),
    });

    assertStatus(response, 201);
    const body = await assertJsonResponse<SessionResponse>(response);

    assert.equal(body.quality, 4);
    assert.equal(body.duration, 30);
    assert.ok(typeof body.id === "string" && /^\d+$/.test(body.id));
    assert.ok(typeof body.createdAt === "string");

    const persisted = await prisma.session.findUnique({ where: { id: body.id } });
    assert.ok(persisted);
    assert.equal(persisted?.quality, 4);
    assert.equal(persisted?.duration, 30);
  });

  it("POST /sessions returns 400 when required fields are missing", async () => {
    const response = await apiRequest("/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ duration: 30 }),
    });

    assertStatus(response, 400);
    const body = await assertJsonResponse<ErrorResponse>(response);
    assert.equal(body.error, "quality and duration must both be integers");
  });

  it("POST /sessions returns 400 when values are not integers", async () => {
    const response = await apiRequest("/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quality: 3.5, duration: "30" }),
    });

    assertStatus(response, 400);
    const body = await assertJsonResponse<ErrorResponse>(response);
    assert.equal(body.error, "quality and duration must both be integers");
  });

  it("DELETE /sessions/:id returns 400 for invalid route ids", async () => {
    const nonNumericResponse = await apiRequest("/sessions/not-a-number", { method: "DELETE" });
    assertStatus(nonNumericResponse, 400);
    const nonNumericBody = await assertJsonResponse<ErrorResponse>(nonNumericResponse);
    assert.equal(nonNumericBody.error, "id must be a valid snowflake string");
  });

  it("DELETE /sessions/:id returns 404 when session does not exist", async () => {
    const response = await apiRequest(`/sessions/${generateSnowflake()}`, { method: "DELETE" });

    assertStatus(response, 404);
  });

  it("DELETE /sessions/:id returns 204 and removes an existing session", async () => {
    const existing = await createSession({ quality: 1, duration: 10 });

    const response = await apiRequest(`/sessions/${existing.id}`, { method: "DELETE" });
    assertStatus(response, 204);

    const persisted = await prisma.session.findUnique({ where: { id: existing.id } });
    assert.equal(persisted, null);
  });
});
