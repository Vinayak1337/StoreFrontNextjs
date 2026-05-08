'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: {
		id: string;
		sessionId: string;
		sessionType: string;
	} | null;
}

const publicUser = {
	id: 'public',
	sessionId: 'public',
	sessionType: 'public'
};

export function useAuth() {
	const router = useRouter();
	const pathname = usePathname();
	const [authState, setAuthState] = useState<AuthState>({
		isAuthenticated: true,
		isLoading: false,
		user: publicUser
	});

	const checkAuthStatus = useCallback(async () => {
		setAuthState({
			isAuthenticated: true,
			isLoading: false,
			user: publicUser
		});
	}, []);

	const logout = useCallback(async () => {
		setAuthState({
			isAuthenticated: true,
			isLoading: false,
			user: publicUser
		});
		window.location.href = '/dashboard';
	}, []);

	const login = useCallback((userData: { id: string; sessionId: string; sessionType: string }) => {
		setAuthState({
			isAuthenticated: true,
			isLoading: false,
			user: userData
		});
	}, []);

	// Check auth status on mount and when pathname changes
	useEffect(() => {
		checkAuthStatus();
	}, [checkAuthStatus, pathname]);

	// Auto-redirect logic
	useEffect(() => {
		if (authState.isLoading) return; // Wait for loading to complete

		const isLoginPage = pathname === '/login';

		if (isLoginPage) {
			router.replace('/dashboard');
		}
	}, [authState.isLoading, pathname, router]);

	return {
		...authState,
		checkAuthStatus,
		logout,
		login
	};
}
