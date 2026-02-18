import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenHash,
  generateId,
} from '../lib/jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-tests';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

describe('JWT', () => {
  describe('generateAccessToken / verifyAccessToken', () => {
    it('generates and verifies a valid access token', () => {
      const token = generateAccessToken('user-123', 'test@example.com');
      const payload = verifyAccessToken(token);

      expect(payload.sub).toBe('user-123');
      expect(payload.email).toBe('test@example.com');
      expect(payload.type).toBe('access');
      expect(payload.iat).toBeTypeOf('number');
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('rejects a tampered token', () => {
      const token = generateAccessToken('user-123', 'test@example.com');
      const tampered = token.slice(0, -5) + 'XXXXX';

      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('rejects a refresh token when access is expected', () => {
      const token = generateRefreshToken('user-123', 'test@example.com');
      expect(() => verifyAccessToken(token)).toThrow('Expected access token');
    });
  });

  describe('generateRefreshToken / verifyRefreshToken', () => {
    it('generates and verifies a valid refresh token', () => {
      const token = generateRefreshToken('user-456', 'other@example.com');
      const payload = verifyRefreshToken(token);

      expect(payload.sub).toBe('user-456');
      expect(payload.email).toBe('other@example.com');
      expect(payload.type).toBe('refresh');
    });

    it('rejects an access token when refresh is expected', () => {
      const token = generateAccessToken('user-123', 'test@example.com');
      expect(() => verifyRefreshToken(token)).toThrow('Expected refresh token');
    });
  });

  describe('token expiry', () => {
    it('access token expires after 15 minutes', () => {
      const token = generateAccessToken('user-123', 'test@example.com');
      const payload = verifyAccessToken(token);
      // 15 min = 900 seconds
      expect(payload.exp - payload.iat).toBe(900);
    });

    it('refresh token expires after 7 days', () => {
      const token = generateRefreshToken('user-123', 'test@example.com');
      const payload = verifyRefreshToken(token);
      // 7 days = 604800 seconds
      expect(payload.exp - payload.iat).toBe(604800);
    });
  });

  describe('generateTokenHash', () => {
    it('produces a consistent hash for the same token', () => {
      const hash1 = generateTokenHash('my-token');
      const hash2 = generateTokenHash('my-token');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different tokens', () => {
      const hash1 = generateTokenHash('token-a');
      const hash2 = generateTokenHash('token-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateId', () => {
    it('generates a hex string', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{32}$/);
    });

    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('missing JWT_SECRET', () => {
    it('throws when JWT_SECRET is not set', () => {
      const orig = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateAccessToken('user', 'e@e.com')).toThrow('JWT_SECRET');

      process.env.JWT_SECRET = orig;
    });
  });
});
