// Enum for order status
export enum OrderStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED'
}

// Item model
export interface Item {
	id: string;
	name: string;
	price: number;
	quantity: number;
	inStock: boolean;
	weight?: number;
	weightUnit?: 'kg' | 'g' | 'l' | 'ml';
	createdAt: string;
}

// Order item model
export interface OrderItem {
	id: string;
	itemId: string;
	orderId: string;
	quantity: number;
	price: number;
	item?: Item;
}

// Order model
export interface Order {
	id: string;
	customerName: string;
	status: OrderStatus;
	orderItems: OrderItem[];
	createdAt: string;
	bill?: Bill;
}

// Bill model
export interface Bill {
	id: string;
	orderId: string;
	totalAmount: number;
	taxes: number;
	paymentMethod: string;
	createdAt: string;
	order?: Order;
	isPaid?: boolean;
}

// User type
export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: string;
	avatar?: string;
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

export interface DailySalesItem {
	date: string;
	totalAmount: number;
	count: number;
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
	activeItem: Item | null;
	loading: boolean;
	error: string | null;
}

export interface OrdersState {
	orders: Order[];
	activeOrder: Order | null;
	loading: boolean;
	error: string | null;
}

export interface BillsState {
	bills: Bill[];
	activeBill: Bill | null;
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

// Settings types
export interface Settings {
	id?: string;
	storeName: string;
	address: string;
	phone: string;
	email: string;
	taxRate: number;
	currency: string;
	logo?: string;
	footer?: string;
	notifications: {
		lowStock: boolean;
		newOrders: boolean;
		orderStatus: boolean;
		dailyReports: boolean;
	};
}

export interface SettingsState {
	settings: Settings | null;
	loading: boolean;
	error: string | null;
}
