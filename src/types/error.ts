// Error types for API
export interface ApiError {
	message: string;
	status?: number;
	code?: string;
}

// Custom error class for API errors
export class ApiErrorClass extends Error {
	status: number;
	code?: string;

	constructor(message: string, status: number = 500, code?: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

// Type guard for ApiError
export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as ApiError).message === 'string'
	);
}
