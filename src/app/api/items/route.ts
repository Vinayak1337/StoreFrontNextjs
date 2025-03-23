import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CSRF_HEADER, CSRF_TOKEN_COOKIE } from '@/lib/csrf';

// Helper function to parse cookies from header
function parseCookies(cookieHeader: string) {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) return cookies;

	cookieHeader.split(';').forEach(cookie => {
		const [name, value] = cookie.trim().split('=');
		if (name && value) {
			cookies[name] = value;
		}
	});

	return cookies;
}

// GET /api/items - Get all items
export async function GET() {
	try {
		const items = await prisma.item.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});

		return NextResponse.json(items);
	} catch (error) {
		console.error('Error fetching items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch items' },
			{ status: 500 }
		);
	}
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
	try {
		// CSRF Check
		const cookieHeader = request.headers.get('cookie') || '';
		const cookies = parseCookies(cookieHeader);
		const csrfCookie = cookies[CSRF_TOKEN_COOKIE];
		const csrfHeader = request.headers.get(CSRF_HEADER);

		if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
			return NextResponse.json(
				{ error: 'Invalid CSRF token' },
				{ status: 403 }
			);
		}

		// Process the request
		const body = await request.json();

		const { name, price, weight, weightUnit, quantity, inStock, metadata } =
			body;

		if (!name || !price) {
			return NextResponse.json(
				{ error: 'Name and price are required' },
				{ status: 400 }
			);
		}

		// Convert string values to appropriate types
		const itemData = {
			name,
			price: typeof price === 'string' ? parseFloat(price) : price,
			weight: weight
				? typeof weight === 'string'
					? parseFloat(weight)
					: weight
				: undefined,
			weightUnit: weight ? weightUnit : undefined,
			quantity: quantity
				? typeof quantity === 'string'
					? parseInt(quantity, 10)
					: quantity
				: 1,
			inStock: inStock !== undefined ? inStock : true,
			metadata: metadata || {}
		};

		const item = await prisma.item.create({
			data: itemData
		});

		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error creating item:', error);
		return NextResponse.json(
			{ error: 'Failed to create item' },
			{ status: 500 }
		);
	}
}
