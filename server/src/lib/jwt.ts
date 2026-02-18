import { createHmac, randomBytes } from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
  jti: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function sign(payload: JwtPayload): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', getSecret())
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verify(token: string, type: 'access' | 'refresh'): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [header, body, signature] = parts;
  const expected = createHmac('sha256', getSecret())
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expected) throw new Error('Invalid token signature');

  const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;

  if (payload.type !== type) throw new Error(`Expected ${type} token`);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error('Token expired');

  return payload;
}

const ACCESS_TOKEN_TTL = 15 * 60;       // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 3600; // 7 days

export function generateAccessToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomBytes(16).toString('hex');
  return sign({ sub: userId, email, iat: now, exp: now + ACCESS_TOKEN_TTL, type: 'access', jti });
}

export function generateRefreshToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomBytes(16).toString('hex');
  return sign({ sub: userId, email, iat: now, exp: now + REFRESH_TOKEN_TTL, type: 'refresh', jti });
}

export function verifyAccessToken(token: string): JwtPayload {
  return verify(token, 'access');
}

export function verifyRefreshToken(token: string): JwtPayload {
  return verify(token, 'refresh');
}

export function generateTokenHash(token: string): string {
  return createHmac('sha256', 'token-hash-key').update(token).digest('hex');
}

export function generateId(): string {
  return randomBytes(16).toString('hex');
}
