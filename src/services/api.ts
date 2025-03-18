import axios, { AxiosError } from 'axios';
import { ApiError, ApiErrorClass } from '@/types/error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create API service object
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
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	response => {
		return response;
	},
	(error: AxiosError<ApiError>) => {
		// Handle errors globally
		console.error('API Error:', error);

		// Create a more user-friendly error message
		const message =
			error.response?.data?.message ||
			error.message ||
			'An unexpected error occurred';

		const status = error.response?.status || 500;
		const code = error.response?.data?.code;

		// Create a standardized error object
		const apiError = new ApiErrorClass(message, status, code);

		return Promise.reject(apiError);
	}
);

export default api;
