'use client';

import { http, HttpResponse } from 'msw';
import { sampleItems, sampleOrders, sampleBills } from './data';

// Create mutable copies for operations
const itemsData = [...sampleItems];
const ordersData = [...sampleOrders];
const billsData = [...sampleBills];

export const handlers = [
	// Items endpoints
	http.get('/api/items', () => {
		return HttpResponse.json(itemsData);
	}),

	http.post('/api/items', async ({ request }) => {
		const newItem = await request.json();
		const id = itemsData.length > 0 ? Math.max(...itemsData.map(item => item.id)) + 1 : 1;
		
		const item = {
			id,
			...newItem,
			date: new Date().toISOString()
		};
		
		itemsData.push(item);
		return HttpResponse.json(item, { status: 201 });
	}),

	http.put('/api/items/:id', async ({ params, request }) => {
		const id = Number(params.id);
		const updates = await request.json();
		
		const index = itemsData.findIndex(item => item.id === id);
		if (index === -1) {
			return new HttpResponse(null, { status: 404 });
		}
		
		itemsData[index] = { ...itemsData[index], ...updates };
		return HttpResponse.json(itemsData[index]);
	}),

	http.delete('/api/items/:id', ({ params }) => {
		const id = Number(params.id);
		const index = itemsData.findIndex(item => item.id === id);
		
		if (index === -1) {
			return new HttpResponse(null, { status: 404 });
		}
		
		itemsData.splice(index, 1);
		return new HttpResponse(null, { status: 204 });
	}),

	// Orders endpoints
	http.get('/api/orders', () => {
		return HttpResponse.json(ordersData);
	}),

	http.post('/api/orders', async ({ request }) => {
		const data = await request.json();
		const id = ordersData.length > 0 ? Math.max(...ordersData.map(order => order.id)) + 1 : 1;
		
		const newOrder = {
			id,
			...data,
			date: new Date().toISOString()
		};
		
		ordersData.push(newOrder);
		return HttpResponse.json(newOrder, { status: 201 });
	}),

	http.put('/api/orders/:id', async ({ params, request }) => {
		const id = Number(params.id);
		const updates = await request.json();
		
		const index = ordersData.findIndex(order => order.id === id);
		if (index === -1) {
			return new HttpResponse(null, { status: 404 });
		}
		
		ordersData[index] = { ...ordersData[index], ...updates };
		return HttpResponse.json(ordersData[index]);
	}),

	// Bills endpoints
	http.get('/api/bills', () => {
		return HttpResponse.json(billsData);
	}),

	http.post('/api/bills', async ({ request }) => {
		const data = await request.json();
		const id = billsData.length > 0 ? Math.max(...billsData.map(bill => bill.id)) + 1 : 1;
		
		const newBill = {
			id,
			...data,
			date: new Date().toISOString()
		};
		
		billsData.push(newBill);
		return HttpResponse.json(newBill, { status: 201 });
	}),

	// Analytics endpoints
	http.get('/api/analytics/daily-sales', ({ request }) => {
		const url = new URL(request.url);
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');
		
		if (!startDate || !endDate) {
			return new HttpResponse(
				JSON.stringify({ error: 'Start date and end date are required' }),
				{ status: 400 }
			);
		}
		
		const startDateTime = new Date(startDate).getTime();
		const endDateTime = new Date(endDate).getTime();
		
		// Find bills in date range
		const billsInRange = billsData.filter(bill => {
			const billDate = new Date(bill.date).getTime();
			return billDate >= startDateTime && billDate <= endDateTime;
		});
		
		// Group by date
		const dailySales: Record<string, { date: string; sales: number }> = {};
		
		billsInRange.forEach(bill => {
			const dateString = new Date(bill.date).toISOString().split('T')[0];
			
			if (!dailySales[dateString]) {
				dailySales[dateString] = {
					date: dateString,
					sales: 0
				};
			}
			
			dailySales[dateString].sales += Number(bill.totalAmount);
		});
		
		// Convert to array and sort
		const result = Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date));
		
		return HttpResponse.json(result);
	})
];
