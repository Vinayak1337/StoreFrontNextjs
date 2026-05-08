import api from '@/lib/services/api';
import { printDirectlyToThermalPrinter } from './direct-thermal-print';
import {
	getBluetoothPrinterErrorMessage,
	getPreferredBluetoothPrinter,
	isBluetoothPrinterConnectivityError,
	pairBluetoothPrinter
} from './bluetooth';

const fallbackThermalSettings: Settings = {
	storeName: 'Store',
	address: 'Address',
	phone: 'Phone',
	email: 'Email',
	currency: '₹',
	footer: 'Thank you for your business!',
	taxRate: 0,
	notifications: {
		outOfStock: false,
		newOrders: false,
		orderStatus: false,
		dailyReports: false
	},
	printer: {
		name: '',
		deviceId: '',
		type: 'bluetooth',
		autoConnect: false,
		connected: false,
		paperWidth: 58
	}
};

interface PrintThermalOrderOptions {
	orderId: string;
	settings: Settings | null;
	onPrinterPaired?: (printer: PrinterDevice) => void;
}

async function loadOrder(orderId: string): Promise<Order> {
	const orderDetails = await api.getOrderById(orderId);

	if (!orderDetails) {
		throw new Error('Order not found');
	}

	return orderDetails;
}

export async function printThermalOrder({
	orderId,
	settings,
	onPrinterPaired
}: PrintThermalOrderOptions): Promise<void> {
	const settingsToUse = settings || fallbackThermalSettings;
	const currentPrinter = await getPreferredBluetoothPrinter();

	if (!currentPrinter) {
		const pairedPrinter = await pairBluetoothPrinter({ preferSaved: false });
		if (!pairedPrinter) {
			throw new Error('No printer selected');
		}

		onPrinterPaired?.(pairedPrinter);
	}

	const orderDetails = await loadOrder(orderId);

	try {
		await printDirectlyToThermalPrinter(orderDetails, settingsToUse);
	} catch (error) {
		if (!isBluetoothPrinterConnectivityError(error)) {
			throw error;
		}

		const retryPrinter = await pairBluetoothPrinter({ preferSaved: false });
		if (!retryPrinter) {
			throw new Error('No printer selected');
		}

		onPrinterPaired?.(retryPrinter);
		await printDirectlyToThermalPrinter(orderDetails, settingsToUse);
	}
}

export function getThermalOrderPrintErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message === 'Order not found') {
		return 'Order not found';
	}

	return getBluetoothPrinterErrorMessage(error);
}
