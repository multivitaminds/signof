import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/database.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenHash,
  generateId,
} from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

const router = Router();
const BCRYPT_ROUNDS = 12;

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface RefreshTokenRow {
  id: string;
  user_id: string;
  revoked: number;
}

function formatUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

function issueTokens(userId: string, email: string) {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);

  // Store refresh token hash
  const db = getDatabase();
  const tokenId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  db.prepare(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked) VALUES (?, ?, ?, ?, ?, 0)'
  ).run(tokenId, userId, generateTokenHash(refreshToken), expiresAt, new Date().toISOString());

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

// POST /api/auth/signup
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body as {
      email?: string;
      password?: string;
      displayName?: string;
    };

    if (!email || !password || !displayName) {
      res.status(400).json({ error: 'Email, password, and display name are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const id = generateId();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, normalizedEmail, displayName.trim(), passwordHash, now, now);

    const tokens = issueTokens(id, normalizedEmail);

    logger.info('User signed up', { userId: id, email: normalizedEmail });

    res.status(201).json({
      user: { id, email: normalizedEmail, displayName: displayName.trim(), avatarUrl: null },
      tokens,
    });
  } catch (err) {
    logger.error('Signup error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDatabase();

    const row = db.prepare(
      'SELECT id, email, display_name, password_hash, avatar_url, created_at FROM users WHERE email = ?'
    ).get(normalizedEmail) as (UserRow & { password_hash: string }) | undefined;

    if (!row) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokens = issueTokens(row.id, row.email);

    logger.info('User logged in', { userId: row.id, email: row.email });

    res.json({ user: formatUser(row), tokens });
  } catch (err) {
    logger.error('Login error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const db = getDatabase();
    const tokenHash = generateTokenHash(refreshToken);

    const stored = db.prepare(
      'SELECT id, user_id, revoked FROM refresh_tokens WHERE token_hash = ?'
    ).get(tokenHash) as RefreshTokenRow | undefined;

    if (!stored || stored.revoked) {
      // If a revoked token is used, revoke ALL tokens for this user (possible theft)
      if (stored?.revoked) {
        db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(stored.user_id);
        logger.warn('Revoked token reuse detected, revoking all tokens', { userId: stored.user_id });
      }
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Revoke the old token
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(stored.id);

    // Issue new tokens
    const tokens = issueTokens(payload.sub, payload.email);

    res.json(tokens);
  } catch (err) {
    logger.error('Refresh error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const db = getDatabase();
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(userId);

    logger.info('User logged out', { userId });
    res.json({ ok: true });
  } catch (err) {
    logger.error('Logout error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/auth/me', (req, res) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const db = getDatabase();
    const row = db.prepare(
      'SELECT id, email, display_name, avatar_url, created_at FROM users WHERE id = ?'
    ).get(userId) as UserRow | undefined;

    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUser(row));
  } catch (err) {
    logger.error('Get user error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/onboarding
router.post('/auth/onboarding', (req, res) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    logger.info('Onboarding completed', { userId, data: req.body });
    res.json({ ok: true });
  } catch (err) {
    logger.error('Onboarding error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
