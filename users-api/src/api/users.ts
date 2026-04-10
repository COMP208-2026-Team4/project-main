import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../resolvers";
import { generateSnowflake } from "../snowflake";
import { requireAuth, JwtPayload } from "../middleware/auth";
import { findByUsernameInsensitive } from "./username";

const router = express.Router();

// ── GET /users/me ─────────────────────────────────────────────────────────────
// Returns the authenticated user's own profile.
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const { sub } = (req as any).user as JwtPayload;

  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Never expose the password hash
  const { password: _pw, ...safe } = user;
  res.status(200).json(safe);
});

// ── GET /users/:username ───────────────────────────────────────────────────────
// Public profile lookup by username (case-insensitive).
router.get("/:username", async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await findByUsernameInsensitive(username);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Public profile: never expose password hash or email address.
  const { password: _pw, email: _email, ...publicProfile } = user;
  res.status(200).json(publicProfile);
});

// ── POST /users ───────────────────────────────────────────────────────────────
// Create a new user with email/password credentials.
router.post("/", async (req: Request, res: Response) => {
  const { email, username, password } = req.body as {
    email?: string;
    username?: string;
    password?: string;
  };

  if (!email || !username || !password) {
    res.status(400).json({ error: "email, username, and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const id = generateSnowflake();

  try {
    const user = await prisma.user.create({
      data: { id, email, username, password: hashed },
    });
    const { password: _pw, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      res.status(409).json({ error: "email or username already taken" });
      return;
    }
    throw err;
  }
});

// ── PUT /users/:id ────────────────────────────────────────────────────────────
// Update a user's profile. Only the owner (verified via JWT) may do this.
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { sub } = (req as any).user as JwtPayload;
  const { id } = req.params;

  if (sub !== id) {
    res.status(403).json({ error: "Forbidden: you can only update your own profile" });
    return;
  }

  const { username, avatarUrl } = req.body as {
    username?: string;
    avatarUrl?: string;
  };

  if (!username && !avatarUrl) {
    res.status(400).json({ error: "At least one field to update is required (username, avatarUrl)" });
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(avatarUrl && { avatarUrl }),
      },
    });
    const { password: _pw, ...safe } = updated;
    res.status(200).json(safe);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      res.status(404).json({ error: `User ${id} not found` });
      return;
    }
    throw err;
  }
});

export default router;
