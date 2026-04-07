import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Zero-trust JWT validation middleware.
 * Every request must carry a valid Bearer token - the middleware
 * independently verifies the signature using JWT_SECRET.
 * It does NOT trust forwarded headers from other services.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    // Attach verified user to request for downstream handlers
    (req as any).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Issue a signed JWT for a user.
 */
export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const secret = process.env.JWT_SECRET!;
  const expiry = (process.env.JWT_EXPIRY ?? "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn: expiry });
}
