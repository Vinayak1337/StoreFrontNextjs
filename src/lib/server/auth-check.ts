import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../auth-constants';
import { redirect } from 'next/navigation';

export async function checkAuth() {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(COOKIE_NAME);
	
	if (!sessionCookie) {
		redirect('/login');
	}
	
	return true;
}

export async function getAuthStatus() {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(COOKIE_NAME);
	
	return {
		isAuthenticated: !!sessionCookie,
		session: sessionCookie?.value
	};
}
