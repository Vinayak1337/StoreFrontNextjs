import { NextRequest, NextResponse } from 'next/server';
import { getDailySales } from './actions';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		if (!start || !end) {
			return NextResponse.json({ error: 'start and end query params required' }, { status: 400 });
		}
		const data = await getDailySales(start, end);
		return NextResponse.json(data);
	} catch (error) {
		console.error('Analytics API error:', error);
		return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
	}
}