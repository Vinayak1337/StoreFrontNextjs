import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you would use Redis or another persistent store
type RateLimitData = {
	count: number;
	resetAt: number;
};

const store: Map<string, RateLimitData> = new Map();

// Rate limiter function creator
export function rateLimiter(options: {
	interval: number; // in milliseconds
	limit: number; // max requests per interval
}) {
	return function createRateLimitedHandler(
		handler: (req: NextRequest) => Promise<NextResponse>
	) {
		return async function rateLimitedHandler(req: NextRequest) {
			// Get client identifier from headers or connection info
			const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

			// Get current time
			const now = Date.now();

			// Clean up expired entries - do this occasionally to prevent memory leaks
			if (Math.random() < 0.1) {
				// 10% chance to run cleanup on each request
				for (const [key, data] of store.entries()) {
					if (data.resetAt < now) {
						store.delete(key);
					}
				}
			}

			// Initialize or get current entry
			let data = store.get(clientIp);
			if (!data || data.resetAt < now) {
				data = {
					count: 0,
					resetAt: now + options.interval
				};
			}

			// Increment request count
			data.count += 1;

			// Update store
			store.set(clientIp, data);

			// Check if rate limit is exceeded
			if (data.count > options.limit) {
				return NextResponse.json(
					{ error: 'Too many requests, please try again later' },
					{
						status: 429,
						headers: {
							'Retry-After': Math.ceil((data.resetAt - now) / 1000).toString()
						}
					}
				);
			}

			// Continue to the handler
			try {
				return await handler(req);
			} catch (error) {
				console.error('Error in rate-limited handler:', error);
				return NextResponse.json(
					{ error: 'Internal Server Error' },
					{ status: 500 }
				);
			}
		};
	};
}
