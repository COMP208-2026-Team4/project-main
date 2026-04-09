import express, { Request, Response } from "express";
import { prisma } from "../resolvers";
import { generateSnowflake } from "../snowflake";
import { signToken } from "../middleware/auth";

const router = express.Router();

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Helper to fetch with retries for transient network errors
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delayMs = 500
): Promise<Response> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err: any) {
      lastError = err;
      const isRetryable =
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND" ||
        err.name === "AbortError" ||
        err.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
      if (!isRetryable || i === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

// -> GET /auth/google
// Redirect the user to Google's OAuth2 consent screen.
router.get("/google", (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: "Google OAuth is not configured" });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// -> GET /auth/google/callback
// Google redirects here after consent. Exchange the code for tokens,
// retrieve the user's profile, create or fetch the user, then issue a JWT.
router.get("/google/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

  if (error || !code) {
    res.redirect(`${frontendUrl}/login?error=oauth_denied`);
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  try {
    // 1. Exchange code for access token (with timeout)
    const controller = new AbortController();
    const timeoutMs = parseInt(process.env.OAUTH_TIMEOUT_MS ?? "30000", 10);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.statusText}`);
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // 2. Fetch user info from Google (with timeout, retry, and delay)
    // Small delay helps with mobile hotspots that have aggressive NAT
    await new Promise((r) => setTimeout(r, 300));

    const userInfoRes = await fetchWithRetry(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        signal: AbortSignal.timeout(timeoutMs),
      },
      2,
      500
    );

    if (!userInfoRes.ok) {
      throw new Error(`User info fetch failed: ${userInfoRes.statusText}`);
    }

    const googleUser = (await userInfoRes.json()) as GoogleUserInfo;

    // 3. Create or retrieve user in DB
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      const id = generateSnowflake();
      // Derive a username from the display name; ensure uniqueness with snowflake suffix
      const baseUsername = googleUser.name.replace(/\s+/g, "").toLowerCase();
      const username = `${baseUsername}_${id.slice(-4)}`;

      user = await prisma.user.create({
        data: {
          id,
          email: googleUser.email,
          username,
          avatarUrl: googleUser.picture ?? null,
          // password stays null - OAuth-only account
        },
      });
    }

    // 4. Issue JWT
    const token = signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    // 5. Redirect to frontend with token in query string
    // (frontend stores it in localStorage then strips the URL param)
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error("[OAuth] Request timed out (oauth2.googleapis.com)");
    } else if (err.cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
      console.error("[OAuth] Connection timeout - check network/proxy settings");
    } else if (err.code === "ECONNRESET") {
      console.error("[OAuth] TLS connection reset - network may be unstable");
    } else {
      console.error("[OAuth] callback error:", err);
    }
    res.redirect(`${frontendUrl}/login?error=server_error`);
  }
});

export default router;
