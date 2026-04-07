import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
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

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configPath = path.join(__dirname, '..', 'config.yaml');
let config: Config;

try {
  const fileContents = fs.readFileSync(configPath, 'utf8');
  config = yaml.load(fileContents) as Config;
} catch (err) {
  console.error('Error loading config.yaml:', err);
  process.exit(1);
}

const publicRoutes: string[] = config.public_routes ?? ['/auth'];

Object.entries(config.routes).forEach(([routePath, target]) => {
  const isPublic = publicRoutes.some((p) => routePath.startsWith(p));

  const proxyOptions: Options = {
    target,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req) => {
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${target}${proxyReq.path}`);

      // Forward the original Authorization header so downstream services
      // can independently re-validate the JWT (zero-trust).
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
