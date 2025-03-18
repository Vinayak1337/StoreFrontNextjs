'use client';

import { Item, Order, Bill, OrderStatus } from '@/types';

// Sample data for items
export const sampleItems: Item[] = [
	{
		id: '1',
		name: 'Laptop',
		price: 1200,
		quantity: 15,
		weight: 2.5
	},
	{
		id: '2',
		name: 'Smartphone',
		price: 800,
		quantity: 25,
		weight: 0.3
	},
	{
		id: '3',
		name: 'Headphones',
		price: 150,
		quantity: 40,
		weight: 0.25
	},
	{
		id: '4',
		name: 'Monitor',
		price: 350,
		quantity: 20,
		weight: 5
	},
	{
		id: '5',
		name: 'Keyboard',
		price: 80,
		quantity: 30,
		weight: 0.8
	},
	{
		id: '6',
		name: 'Mouse',
		price: 40,
		quantity: 35,
		weight: 0.2
	}
];

// Sample data for orders
export const sampleOrders: Order[] = [
	{
		id: '1',
		customerName: 'John Doe',
		status: OrderStatus.COMPLETED,
		date: '2023-05-15T14:30:00Z',
		items: [
			{
				itemId: '1',
				name: 'Laptop',
				quantity: 1,
				price: 1200
			},
			{
				itemId: '3',
				name: 'Headphones',
				quantity: 1,
				price: 150
			}
		]
	},
	{
		id: '2',
		customerName: 'Jane Smith',
		status: OrderStatus.PENDING,
		date: '2023-05-16T09:45:00Z',
		items: [
			{
				itemId: '2',
				name: 'Smartphone',
				quantity: 1,
				price: 800
			}
		]
	},
	{
		id: '3',
		customerName: 'Robert Johnson',
		status: OrderStatus.COMPLETED,
		date: '2023-05-16T16:20:00Z',
		items: [
			{
				itemId: '4',
				name: 'Monitor',
				quantity: 2,
				price: 350
			},
			{
				itemId: '5',
				name: 'Keyboard',
				quantity: 1,
				price: 80
			},
			{
				itemId: '6',
				name: 'Mouse',
				quantity: 1,
				price: 40
			}
		]
	},
	{
		id: '4',
		customerName: 'Emily Davis',
		status: OrderStatus.CANCELLED,
		date: '2023-05-17T11:10:00Z',
		items: [
			{
				itemId: '1',
				name: 'Laptop',
				quantity: 1,
				price: 1200
			}
		]
	}
];

// Sample data for bills
export const sampleBills: Bill[] = [
	{
		id: '1',
		orderId: '1',
		customerName: 'John Doe',
		totalAmount: 1350,
		date: '2023-05-15T14:40:00Z',
		paymentMethod: 'credit_card'
	},
	{
		id: '2',
		orderId: '3',
		customerName: 'Robert Johnson',
		totalAmount: 820,
		date: '2023-05-16T16:30:00Z',
		paymentMethod: 'cash'
	}
];
