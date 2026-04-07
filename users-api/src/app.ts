import dotenv from "dotenv";
import path from "path";

// Only load .env file if running outside Docker (Docker provides env vars directly)
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

// Validate critical environment variables at startup
if (!process.env.JWT_SECRET) {
  console.error("[Auth] JWT_SECRET is not configured");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import usersRouter from "./api/users";
import oauthRouter from "./api/oauth";

async function startServer() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());

  app.use("/users", usersRouter);
  app.use("/auth", oauthRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT ?? 6024;
  app.listen(port, () => {
    console.log(`users-api running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start users-api:", err);
  process.exitCode = 1;
});
