// Enum for order status
export enum OrderStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED'
}

// Item model
export interface Item {
	id: number;
	name: string;
	price: number;
	quantity: number;
	weight?: number;
}

// Order item model
export interface OrderItem {
	itemId: number;
	name: string;
	quantity: number;
	price: number;
}

// Order model
export interface Order {
	id: number;
	customerName: string;
	status: OrderStatus;
	items: OrderItem[];
	date: string;
}

// Bill model
export interface Bill {
	id: number;
	orderId: number;
	customerName: string;
	totalAmount: number;
	date: string;
	paymentMethod: string;
}

// User type
export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
}

// Authentication types
export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

// Analytics types
export interface DailySales {
	date: string;
	sales: number;
}

export interface AnalyticsMetrics {
	totalOrders: number;
	totalSales: number;
	averageOrderValue: number;
	conversionRate: number;
	revenueTrend: number;
	ordersTrend: number;
	conversionTrend: number;
	topSellingItems: Array<{
		id: string;
		name: string;
		quantity: number;
		revenue: number;
	}>;
	paymentMethodDistribution: Record<string, number>;
}

// State types for Redux
export interface ItemsState {
	items: Item[];
	loading: boolean;
	error: string | null;
}

export interface OrdersState {
	orders: Order[];
	loading: boolean;
	error: string | null;
}

export interface BillsState {
	bills: Bill[];
	loading: boolean;
	error: string | null;
}

export interface SalesData {
	dailySales: DailySalesItem[];
}

export interface AnalyticsState {
	salesData: SalesData | null;
	metrics: AnalyticsMetrics | null;
	loading: boolean;
	error: string | null;
}
