import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users, refreshTokens } from '../../db/schema.js';
import { AUTH } from '../../config/constants.js';
import { ConflictError, UnauthorizedError } from '../../common/errors.js';

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRY
  });
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken(userId, email);
  const refreshToken = randomBytes(48).toString('hex');

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  });

  return { accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: and(eq(users.email, email), isNull(users.deletedAt)) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return issueTokenPair(user.id, user.email);
}

export async function register(email: string, password: string, name: string) {
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (existingUser) throw new ConflictError('Email is already registered');

  const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name })
    .returning({ id: users.id, email: users.email, name: users.name });

  return user;
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  const stored = await db.query.refreshTokens.findFirst({
    where: and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, new Date()))
  });

  if (!stored) throw new UnauthorizedError('invalid or expired refresh token');

  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));

  const user = await db.query.users.findFirst({ where: eq(users.id, stored.userId) });

  if (!user) throw new UnauthorizedError('Invalid refresh token');

  return issueTokenPair(user.id, user.email);
}

export async function logout(refreshToken: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)));
}

export async function logoutAll(userId: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}
