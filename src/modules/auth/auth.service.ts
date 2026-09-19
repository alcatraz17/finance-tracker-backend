import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { AUTH } from '../../config/constants.js';
import { ConflictError } from '../../common/errors.js';

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
