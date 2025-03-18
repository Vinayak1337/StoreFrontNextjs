import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor
api.interceptors.request.use(
	config => {
		// You can add auth tokens here if needed
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	response => {
		return response;
	},
	error => {
		// Handle errors globally
		console.error('API Error:', error);

		// Create a more user-friendly error message
		const message =
			error.response?.data?.message ||
			error.message ||
			'An unexpected error occurred';

		return Promise.reject({ ...error, message });
	}
);

export default api;
