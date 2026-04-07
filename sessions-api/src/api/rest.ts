import express from "express";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../resolvers";
import { generateSnowflake, getTimestampFromSnowflake } from "../snowflake";

const router = express.Router();
router.use(express.json());

// GET /sessions -> Retrieve a list of all previous sessions, their assessed quality & duration, from the DB.
router.get("/", async (_req: Request, res: Response) => {
  const sessions = await prisma.session.findMany();

  const sessionsWithTimestamps = sessions
    .map(s => ({ ...s, createdAt: getTimestampFromSnowflake(s.id) }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.status(200).json(sessionsWithTimestamps);
});

// POST /sessions -> Create new session & update database.
router.post("/", async (req: Request, res: Response) => {
  const { quality, duration } = req.body as {
    quality?: number;
    duration?: number;
  };

  if (!Number.isInteger(quality) || !Number.isInteger(duration)) {
    return res
      .status(400)
      .json({ error: "quality and duration must both be integers" });
  }

  const validatedQuality = quality as number;
  const validatedDuration = duration as number;

  const id = generateSnowflake();
  const createdSession = await prisma.session.create({
    data: { id, quality: validatedQuality, duration: validatedDuration },
  });

  return res.status(201).json({ ...createdSession, createdAt: getTimestampFromSnowflake(id) });
});

// DELETE /sessions/:id -> Delete session & update database.
router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!/^\d+$/.test(id)) // validate id is a valid snowflake
    return res.status(400).json({ error: "id must be a valid snowflake string" });

  try {
    await prisma.session.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")
      return res.status(404).json({ error: `session ${id} not found` });
    throw error;
  }
});

export default router;

