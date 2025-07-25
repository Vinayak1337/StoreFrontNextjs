
// Category/Label model
export interface Category {
	id: string;
	name: string;
	color: string;
	order: number;
	createdAt: string;
	items?: ItemCategory[];
	_count?: {
		items: number;
	};
}

// ItemCategory relationship model
export interface ItemCategory {
	id: string;
	itemId: string;
	categoryId: string;
	createdAt: string;
	item?: Item;
	category?: Category;
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
	categories?: ItemCategory[];
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

// Order status enum
export enum OrderStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED'
}

// Order model
export interface Order {
	id: string;
	customerName: string;
	orderItems: OrderItem[];
	createdAt: string;
	status: OrderStatus;
	bill?: Bill;
	customMessage?: string;
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
	pendingOrders: number;
	completedOrders: number;
	cancelledOrders: number;
	printedOrders: number;
	unpaidBills: number;
	conversionRate: number;
	printRate: number;
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
	orderStatusBreakdown: {
		pending: number;
		completed: number;
		cancelled: number;
	};
	printStatusBreakdown: {
		printed: number;
		unprinted: number;
	};
}

// State types for Redux
export interface ItemsState {
	items: Item[];
	categories: Category[];
	activeItem: Item | null;
	activeCategory: Category | null;
	loading: boolean;
	categoryLoading: boolean;
	error: string | null;
	categoryError: string | null;
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
		outOfStock: boolean;
		newOrders: boolean;
		orderStatus: boolean;
		dailyReports: boolean;
	};
	printer: {
		name: string;
		deviceId: string;
		type: 'bluetooth';
		autoConnect: boolean;
		connected: boolean;
		paperWidth: number;
	};
}

export interface SettingsState {
	settings: Settings | null;
	loading: boolean;
	error: string | null;
}

// Add Web Bluetooth API types
declare global {
	interface Window {
		bluetooth?: {
			requestDevice(options?: {
				filters?: Array<{
					services?: string[];
					name?: string;
					namePrefix?: string;
					manufacturerId?: number;
					serviceData?: Record<string, ArrayBuffer>;
				}>;
				optionalServices?: string[];
				acceptAllDevices?: boolean;
			}): Promise<BluetoothDevice>;
		};
	}

	interface Navigator {
		bluetooth?: {
			requestDevice(options?: {
				filters?: Array<{
					services?: string[];
					name?: string;
					namePrefix?: string;
					manufacturerId?: number;
					serviceData?: Record<string, ArrayBuffer>;
				}>;
				optionalServices?: string[];
				acceptAllDevices?: boolean;
			}): Promise<BluetoothDevice>;
		};
	}

	interface BluetoothDevice {
		id: string;
		name?: string;
		gatt?: {
			connected: boolean;
			connect(): Promise<BluetoothRemoteGATTServer>;
			disconnect(): void;
		};
	}

	interface BluetoothRemoteGATTServer {
		device: BluetoothDevice;
		connected: boolean;
		connect(): Promise<BluetoothRemoteGATTServer>;
		disconnect(): void;
		getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
		getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>;
	}

	interface BluetoothRemoteGATTService {
		device: BluetoothDevice;
		uuid: string;
		getCharacteristic(
			characteristic: string
		): Promise<BluetoothRemoteGATTCharacteristic>;
		getCharacteristics(
			characteristic?: string
		): Promise<BluetoothRemoteGATTCharacteristic[]>;
	}

	interface BluetoothRemoteGATTCharacteristic {
		service: BluetoothRemoteGATTService;
		uuid: string;
		properties: {
			broadcast: boolean;
			read: boolean;
			writeWithoutResponse: boolean;
			write: boolean;
			notify: boolean;
			indicate: boolean;
			authenticatedSignedWrites: boolean;
			reliableWrite: boolean;
			writableAuxiliaries: boolean;
		};
		value?: DataView;
		readValue(): Promise<DataView>;
		writeValue(value: BufferSource): Promise<void>;
		startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
		stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
	}
}
