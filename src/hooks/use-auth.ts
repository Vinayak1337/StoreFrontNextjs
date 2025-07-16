'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
	isLoggedIn,
	getCurrentSession,
	verifySession,
	logout as authLogout
} from '@/lib/client/auth-utils';

interface AuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: {
		id: string;
		sessionId: string;
		sessionType: string;
	} | null;
}

export function useAuth() {
	const router = useRouter();
	const pathname = usePathname();
	const [authState, setAuthState] = useState<AuthState>({
		isAuthenticated: false,
		isLoading: true,
		user: null
	});

	const checkAuthStatus = useCallback(async () => {
		try {
			setAuthState(prev => ({ ...prev, isLoading: true }));

			// Check if user is logged in according to localStorage
			const isLocallyAuthenticated = isLoggedIn();
			
			if (!isLocallyAuthenticated) {
				setAuthState({
					isAuthenticated: false,
					isLoading: false,
					user: null
				});
				return;
			}

			// Get session data from localStorage
			const sessionData = getCurrentSession();
			if (!sessionData) {
				setAuthState({
					isAuthenticated: false,
					isLoading: false,
					user: null
				});
				return;
			}

			// Verify session with server
			const isValidSession = await verifySession();
			
			if (isValidSession) {
				setAuthState({
					isAuthenticated: true,
					isLoading: false,
					user: {
						id: sessionData.userId,
						sessionId: sessionData.sessionId,
						sessionType: sessionData.sessionType
					}
				});
			} else {
				// Session invalid, clear auth state
				setAuthState({
					isAuthenticated: false,
					isLoading: false,
					user: null
				});
			}
		} catch (error) {
			console.error('Auth check error:', error);
			setAuthState({
				isAuthenticated: false,
				isLoading: false,
				user: null
			});
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await authLogout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setAuthState({
				isAuthenticated: false,
				isLoading: false,
				user: null
			});
			router.push('/login');
		}
	}, [router]);

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
		const isPublicPage = pathname === '/login'; // Add more public pages if needed

		if (!authState.isAuthenticated && !isPublicPage) {
			// User is not authenticated and trying to access protected page
			router.push('/login');
		} else if (authState.isAuthenticated && isLoginPage) {
			// User is authenticated but on login page, redirect to dashboard
			router.push('/dashboard');
		}
	}, [authState.isAuthenticated, authState.isLoading, pathname, router]);

	return {
		...authState,
		checkAuthStatus,
		logout,
		login
	};
}