interface Category {
	id: string;
	name: string;
	color: string;
	order: number;
	createdAt: Date;
	items?: ItemCategory[];
	_count?: {
		items: number;
	};
}

interface BasicOrder {
	id: string;
	customerName: string;
	customMessage: string | null;
	createdAt: Date;
	updatedAt: Date;
	itemsCount: number;
	totalAmount: number;
}

interface ItemCategory {
	id: string;
	itemId: string;
	categoryId: string;
	createdAt: Date;
	item?: Item;
	category?: Category;
}

interface Item {
	id: string;
	name: string;
	price: number;
	quantity: number;
	inStock: boolean;
	weight?: number;
	weightUnit: string | null;
	createdAt: Date;
	categories?: ItemCategory[];
}

interface OrderItem {
	id: string;
	itemId: string;
	orderId: string;
	quantity: number;
	price: number;
	item?: Item;
}


interface Order {
	id: string;
	customerName: string;
	orderItems: OrderItem[];
	createdAt: Date;
	bill?: Bill;
	customMessage?: string;
}

interface Bill {
	id: string;
	orderId: string;
	totalAmount: number;
	taxes: number;
	paymentMethod: string;
	createdAt: Date;
	order?: Order;
	isPaid?: boolean;
}

interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	avatar?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

interface DailySales {
	date: string;
	sales: number;
}

interface DailySalesItem {
	date: string;
	totalAmount: number;
	count: number;
}

interface AnalyticsMetrics {
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
	printStatusBreakdown: {
		printed: number;
		unprinted: number;
	};
}

interface ItemsState {
	items: Item[];
	categories: Category[];
	activeItem: Item | null;
	activeCategory: Category | null;
	loading: boolean;
	categoryLoading: boolean;
	error: string | null;
	categoryError: string | null;
}

interface OrdersState {
	orders: Order[];
	activeOrder: Order | null;
	loading: boolean;
	error: string | null;
}

interface BillsState {
	bills: Bill[];
	activeBill: Bill | null;
	loading: boolean;
	error: string | null;
}

interface SalesData {
	dailySales: DailySalesItem[];
}

interface AnalyticsState {
	salesData: SalesData | null;
	metrics: AnalyticsMetrics | null;
	loading: boolean;
	error: string | null;
}

interface Settings {
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

interface SettingsState {
	settings: Settings | null;
	loading: boolean;
	error: string | null;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
}

interface PrinterDevice {
	id: string;
	name: string;
	bluetoothDevice?: BluetoothDevice;
	status: 'online' | 'offline' | 'unknown';
	type: 'bluetooth';
}

interface PrinterConfig {
	name: string;
	deviceId: string;
	autoConnect: boolean;
	connected: boolean;
	paperWidth: number;
	type: 'bluetooth';
}

interface RequestDeviceOptions {
	acceptAllDevices?: boolean;
	filters?: BluetoothLEScanFilter[];
	optionalServices?: BluetoothServiceUUID[];
}

interface BluetoothLEScanFilter {
	name?: string;
	namePrefix?: string;
	services?: BluetoothServiceUUID[];
}

type BluetoothServiceUUID = number | string;

declare global {
	interface Navigator {
		bluetooth?: {
			requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
			getDevices?(): Promise<BluetoothDevice[]>;
		};
	}

	interface BluetoothDevice {
		id: string;
		name?: string;
		gatt?: BluetoothRemoteGATTServer;
	}

	interface BluetoothRemoteGATTServer {
		connected: boolean;
		connect(): Promise<BluetoothRemoteGATTServer>;
		disconnect(): void;
		getPrimaryService(
			service: BluetoothServiceUUID
		): Promise<BluetoothRemoteGATTService>;
		getPrimaryServices(
			service?: BluetoothServiceUUID
		): Promise<BluetoothRemoteGATTService[]>;
	}

	interface BluetoothRemoteGATTService {
		uuid: string;
		getCharacteristic(
			characteristic: BluetoothServiceUUID
		): Promise<BluetoothRemoteGATTCharacteristic>;
		getCharacteristics(
			characteristic?: BluetoothServiceUUID
		): Promise<BluetoothRemoteGATTCharacteristic[]>;
	}

	interface BluetoothRemoteGATTCharacteristic {
		uuid: string;
		properties: {
			write: boolean;
			writeWithoutResponse: boolean;
			read: boolean;
			notify: boolean;
		};
		writeValue(value: BufferSource): Promise<void>;
	}
}
