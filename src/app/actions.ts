'use server';

import bcrypt from 'bcrypt';

/**
 * Server action to hash a password
 */
export async function hashPasswordAction(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

/**
 * Server action to verify a password
 */
export async function verifyPasswordAction(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
