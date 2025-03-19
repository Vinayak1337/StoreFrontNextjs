'use server';

import bcrypt from 'bcrypt';

/**
 * Server action to hash a password
 */
export async function hashPasswordAction(password: string): Promise<string> {
	const saltRounds = process.env.BCRYPT_SALT_ROUNDS
		? parseInt(process.env.BCRYPT_SALT_ROUNDS)
		: 10;
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
