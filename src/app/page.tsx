import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME } from '@/lib/auth-constants';

export default async function RootPage() {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(COOKIE_NAME);
	redirect(sessionCookie ? '/dashboard' : '/login');
}
