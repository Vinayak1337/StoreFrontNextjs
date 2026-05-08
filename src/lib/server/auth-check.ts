export async function checkAuth() {
	return true;
}

export async function getAuthStatus() {
	return {
		isAuthenticated: true,
		session: 'public'
	};
}
