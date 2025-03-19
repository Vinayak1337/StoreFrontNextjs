// Server-only auth utilities
import 'server-only';

import bcrypt from 'bcrypt';
import { SESSION_TYPES, COOKIE_NAME } from '../auth-constants';

/**
 * Server-only function to hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = process.env.BCRYPT_SALT_ROUNDS
		? parseInt(process.env.BCRYPT_SALT_ROUNDS)
		: 10;
	return bcrypt.hash(password, saltRounds);
}

/**
 * Server-only function to verify a password against a hash
 */
export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// Re-export constants for convenience
export { SESSION_TYPES, COOKIE_NAME };
