import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import { getDatabase, closeDatabase } from '../db/database.js';
import { verifyAccessToken } from '../lib/jwt.js';

let app: express.Express;
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-auth-secret';

  // Initialize database (creates tables via migrations)
  getDatabase();

  app = express();
  app.use(express.json());

  // Minimal auth middleware for protected routes
  app.use((req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = verifyAccessToken(authHeader.slice(7));
        (req as unknown as { userId: string }).userId = payload.sub;
      } catch {
        // Not valid JWT, that's fine for public endpoints
      }
    }
    next();
  });

  app.use('/api', authRoutes);

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr !== null) {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(() => {
  server?.close();
  closeDatabase();
  delete process.env.JWT_SECRET;
});

beforeEach(() => {
  // Clean up users and refresh_tokens between tests
  const db = getDatabase();
  db.exec('DELETE FROM refresh_tokens');
  db.exec('DELETE FROM users');
});

async function post(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(baseUrl + path, { method: 'POST', headers, body: JSON.stringify(body) });
}

async function get(path: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(baseUrl + path, { headers });
}

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns tokens (201)', async () => {
      const res = await post('/api/auth/signup', {
        email: 'alice@test.com',
        password: 'password123',
        displayName: 'Alice',
      });

      expect(res.status).toBe(201);
      const data = await res.json() as { user: { id: string; email: string; displayName: string }; tokens: { accessToken: string; refreshToken: string; expiresIn: number } };
      expect(data.user.email).toBe('alice@test.com');
      expect(data.user.displayName).toBe('Alice');
      expect(data.tokens.accessToken).toBeTruthy();
      expect(data.tokens.refreshToken).toBeTruthy();
      expect(data.tokens.expiresIn).toBe(900);
    });

    it('rejects duplicate email (409)', async () => {
      await post('/api/auth/signup', {
        email: 'alice@test.com',
        password: 'password123',
        displayName: 'Alice',
      });

      const res = await post('/api/auth/signup', {
        email: 'alice@test.com',
        password: 'different123',
        displayName: 'Alice 2',
      });

      expect(res.status).toBe(409);
    });

    it('rejects missing fields (400)', async () => {
      const res = await post('/api/auth/signup', { email: 'alice@test.com' });
      expect(res.status).toBe(400);
    });

    it('rejects short password (400)', async () => {
      const res = await post('/api/auth/signup', {
        email: 'alice@test.com',
        password: '123',
        displayName: 'Alice',
      });
      expect(res.status).toBe(400);
      const data = await res.json() as { error: string };
      expect(data.error).toContain('8 characters');
    });

    it('lowercases email', async () => {
      const res = await post('/api/auth/signup', {
        email: 'Alice@TEST.com',
        password: 'password123',
        displayName: 'Alice',
      });

      expect(res.status).toBe(201);
      const data = await res.json() as { user: { email: string } };
      expect(data.user.email).toBe('alice@test.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await post('/api/auth/signup', {
        email: 'bob@test.com',
        password: 'securepass123',
        displayName: 'Bob',
      });
    });

    it('logs in with correct credentials (200)', async () => {
      const res = await post('/api/auth/login', {
        email: 'bob@test.com',
        password: 'securepass123',
      });

      expect(res.status).toBe(200);
      const data = await res.json() as { user: { email: string }; tokens: { accessToken: string } };
      expect(data.user.email).toBe('bob@test.com');
      expect(data.tokens.accessToken).toBeTruthy();
    });

    it('rejects wrong password with generic error (401)', async () => {
      const res = await post('/api/auth/login', {
        email: 'bob@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      const data = await res.json() as { error: string };
      expect(data.error).toBe('Invalid email or password');
    });

    it('rejects nonexistent email with generic error (401)', async () => {
      const res = await post('/api/auth/login', {
        email: 'nobody@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      const data = await res.json() as { error: string };
      expect(data.error).toBe('Invalid email or password');
    });

    it('rejects missing fields (400)', async () => {
      const res = await post('/api/auth/login', { email: 'bob@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates refresh tokens', async () => {
      const signupRes = await post('/api/auth/signup', {
        email: 'carol@test.com',
        password: 'password123',
        displayName: 'Carol',
      });
      const signupData = await signupRes.json() as { tokens: { refreshToken: string } };

      const res = await post('/api/auth/refresh', {
        refreshToken: signupData.tokens.refreshToken,
      });

      expect(res.status).toBe(200);
      const data = await res.json() as { accessToken: string; refreshToken: string };
      expect(data.accessToken).toBeTruthy();
      expect(data.refreshToken).toBeTruthy();
      // New refresh token should be different
      expect(data.refreshToken).not.toBe(signupData.tokens.refreshToken);
    });

    it('rejects a revoked refresh token (401)', async () => {
      const signupRes = await post('/api/auth/signup', {
        email: 'dave@test.com',
        password: 'password123',
        displayName: 'Dave',
      });
      const signupData = await signupRes.json() as { tokens: { refreshToken: string } };

      // Use the token once (revokes it)
      await post('/api/auth/refresh', { refreshToken: signupData.tokens.refreshToken });

      // Try to use it again
      const res = await post('/api/auth/refresh', { refreshToken: signupData.tokens.refreshToken });
      expect(res.status).toBe(401);
    });

    it('rejects missing refresh token (400)', async () => {
      const res = await post('/api/auth/refresh', {});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token (200)', async () => {
      const signupRes = await post('/api/auth/signup', {
        email: 'eve@test.com',
        password: 'password123',
        displayName: 'Eve',
      });
      const signupData = await signupRes.json() as { tokens: { accessToken: string } };

      const res = await get('/api/auth/me', signupData.tokens.accessToken);
      expect(res.status).toBe(200);
      const data = await res.json() as { email: string; displayName: string };
      expect(data.email).toBe('eve@test.com');
      expect(data.displayName).toBe('Eve');
    });

    it('returns 401 without token', async () => {
      const res = await get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revokes all refresh tokens for user', async () => {
      const signupRes = await post('/api/auth/signup', {
        email: 'frank@test.com',
        password: 'password123',
        displayName: 'Frank',
      });
      const signupData = await signupRes.json() as { user: { id: string }; tokens: { accessToken: string; refreshToken: string } };

      const logoutRes = await post('/api/auth/logout', {}, signupData.tokens.accessToken);
      expect(logoutRes.status).toBe(200);

      // Refresh token should no longer work
      const refreshRes = await post('/api/auth/refresh', {
        refreshToken: signupData.tokens.refreshToken,
      });
      expect(refreshRes.status).toBe(401);
    });
  });
});
