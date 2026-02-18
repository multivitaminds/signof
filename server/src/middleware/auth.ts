import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';

const PUBLIC_PATHS = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/health',
  '/api/ready',
];

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Public endpoints don't require auth
  if (PUBLIC_PATHS.includes(req.path)) {
    next();
    return;
  }

  const apiKey = process.env.ORCHESTREE_API_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  // Dev mode: if neither API key nor JWT secret configured, allow all requests
  if (!apiKey && !jwtSecret) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  // Try static API key first (backward compat for AI gateway)
  if (apiKey && token === apiKey) {
    next();
    return;
  }

  // Try JWT access token
  if (jwtSecret) {
    try {
      const payload = verifyAccessToken(token);
      (req as unknown as { userId: string }).userId = payload.sub;
      next();
      return;
    } catch {
      // JWT verification failed, fall through
    }
  }

  res.status(401).json({ error: 'Authentication required' });
}
