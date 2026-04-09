import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { createProxyMiddleware, fixRequestBody, Options } from 'http-proxy-middleware';
import { requireAuth } from './middleware/auth';

dotenv.config();

interface Config {
  routes: Record<string, string>;
  /** Routes listed here are publicly accessible (no JWT required). */
  public_routes?: string[];
}

const app: Application = express();

// -> only start server if not running on Vercel (serverless)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Reverse proxy running on port ${PORT}`);
  });
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cone.opportune.work';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configPath = path.join(__dirname, '..', 'config.yaml');
let config: Config;

/**
 * Expand ${VAR} and ${VAR:-default} placeholders in a string using process.env.
 * Lets the same config.yaml drive both local-dev and Docker setups.
 */
function expandEnv(input: string): string {
  return input.replace(/\$\{([A-Z0-9_]+)(?::-([^}]*))?\}/gi, (_m, name, def) => {
    const v = process.env[name];
    return v !== undefined && v !== '' ? v : (def ?? '');
  });
}

try {
  const fileContents = fs.readFileSync(configPath, 'utf8');
  config = yaml.load(expandEnv(fileContents)) as Config;
} catch (err) {
  console.error('Error loading config.yaml:', err);
  process.exit(1);
}

// Fail-fast sanity check: no internal route may resolve to localhost when
// running inside a container — that would call the rest-api itself, not the
// upstream service, and produce confusing 502s / fake CORS errors.
const insideContainer = fs.existsSync('/.dockerenv');
if (insideContainer) {
  for (const [routePath, target] of Object.entries(config.routes)) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(target)) {
      console.error(
        `[Config] Route ${routePath} -> ${target} uses localhost inside a container. ` +
          `Set the matching *_URL env var (e.g. GIT_AGENT_URL=http://git-agent:6025).`,
      );
      process.exit(1);
    }
  }
}

const publicRoutes: string[] = config.public_routes ?? ['/auth'];

Object.entries(config.routes).forEach(([routePath, target]) => {
  const isPublic = publicRoutes.some((p) => routePath.startsWith(p));

  const proxyOptions: Options = {
    target,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyRes: (proxyRes, req) => {
      const origin = req.headers['origin'] as string | undefined;
      if (origin === FRONTEND_URL) {
        proxyRes.headers['access-control-allow-origin'] = FRONTEND_URL;
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      }
      // Remove any CORS headers set by upstream services to avoid duplicates
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${target}${proxyReq.path}`);

      // Forward the original Authorization header so downstream services
      // can independently re-validate the JWT (zero-trust).
      // NOTE: header mutations must happen BEFORE fixRequestBody, which
      // calls proxyReq.write() and flushes the headers.
      const auth = req.headers['authorization'];
      if (auth) proxyReq.setHeader('Authorization', auth);

      // Forward verified user context headers set by requireAuth.
      // Downstream services must NOT trust these alone — they must re-verify
      // the Authorization header themselves.
      const userId = req.headers['x-user-id'];
      const userEmail = req.headers['x-user-email'];
      const userUsername = req.headers['x-user-username'];
      if (userId) proxyReq.setHeader('x-user-id', userId as string);
      if (userEmail) proxyReq.setHeader('x-user-email', userEmail as string);
      if (userUsername) proxyReq.setHeader('x-user-username', userUsername as string);

      // express.json() consumed the body stream; re-emit it to the upstream.
      // fixRequestBody handles content-length and avoids the double-write
      // that previously crashed the process with
      // "Cannot set headers after they are sent to the client".
      fixRequestBody(proxyReq, req);
    },
    onError: (err: Error, req: Request, res: Response) => {
      console.error(`[Proxy Error] ${req.method} ${req.originalUrl}:`, err.message);
      res.status(502).json({ error: 'Bad Gateway', message: 'Upstream service unavailable' });
    },
  };

  if (isPublic) {
    app.use(routePath, createProxyMiddleware(proxyOptions));
  } else {
    app.use(routePath, requireAuth, createProxyMiddleware(proxyOptions));
  }

  console.log(`[Route] ${routePath} -> ${target} (${isPublic ? 'public' : 'protected'})`);
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralised error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
