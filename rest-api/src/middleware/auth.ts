import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Zero-trust JWT validation middleware for the API gateway.
 * Validates the Bearer token and, if valid, forwards user context
 * via x-user-id / x-user-email / x-user-username headers so that
 * downstream services can optionally use them (they must still re-validate
 * the original Authorization header themselves).
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
    console.error("[Auth] JWT_SECRET is not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Forward verified user context to downstream services
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-email"] = payload.email;
    req.headers["x-user-username"] = payload.username;

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
