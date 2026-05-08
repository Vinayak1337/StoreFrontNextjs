/**
 * Bluetooth Printer Discovery Utilities
 */

import { isBluetoothSupported } from './support';
import { savePrinterForDirectUse } from './storage';
import { BLUETOOTH_PRINTER_SERVICE_UUIDS } from './constants';

interface Bluetooth {
	requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
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

interface BluetoothDevice {
	id: string;
	name?: string;
	gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
	connected: boolean;
	connect(): Promise<BluetoothRemoteGATTServer>;
	disconnect(): void;
}

interface PrinterDevice {
	id: string;
	name: string;
	bluetoothDevice?: BluetoothDevice;
	status: 'online' | 'offline' | 'unknown';
	type: 'bluetooth';
}

/**
 * Scans for available Bluetooth thermal printers
 * Shows original device names or "Unknown" if not available
 */
export async function scanForPrinters(): Promise<PrinterDevice[]> {
	// Detailed Bluetooth support check
	if (typeof navigator === 'undefined') {
		throw new Error(
			'Navigator is not available. Are you running in a browser?'
		);
	}

	if (!('bluetooth' in navigator)) {
		throw new Error(
			'Web Bluetooth API is not available. Please use Chrome 56+ or Edge 79+ with HTTPS.'
		);
	}

	// Check if we're on HTTPS (required for Web Bluetooth)
	if (
		typeof window !== 'undefined' &&
		window.location &&
		window.location.protocol !== 'https:' &&
		window.location.hostname !== 'localhost'
	) {
		throw new Error(
			'Web Bluetooth requires HTTPS. Please access the site over HTTPS.'
		);
	}

	if (!isBluetoothSupported()) {
		const userAgent = navigator.userAgent;
		throw new Error(
			`Web Bluetooth is not supported in this browser (${userAgent}). Please use Chrome 56+ or Edge 79+.`
		);
	}

	try {
		// Request Bluetooth device with comprehensive printer service UUIDs
		const device = await (navigator.bluetooth as Bluetooth)?.requestDevice({
			acceptAllDevices: true,
			optionalServices: [...BLUETOOTH_PRINTER_SERVICE_UUIDS]
		});

		if (!device) {
			return [];
		}

		// Return the discovered printer with its original name or "Unknown"
		const printerDevice: PrinterDevice = {
			id: device.id,
			name: device.name || 'Unknown',
			bluetoothDevice: device,
			status: 'online',
			type: 'bluetooth'
		};

		// Automatically save this printer for direct use
		savePrinterForDirectUse(printerDevice);
		console.log(
			'Printer automatically saved for direct use:',
			printerDevice.name
		);

		return [printerDevice];
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.name === 'NotFoundError') {
				// User cancelled the selection dialog or no device was found
				return [];
			} else if (error.name === 'SecurityError') {
				throw new Error(
					'Bluetooth permission denied. Please allow Bluetooth access.'
				);
			} else if (error.message.includes('globally disabled')) {
				throw new Error(
					'Web Bluetooth API is disabled. Please enable it in your browser settings.'
				);
			}
		}

		console.error('Error scanning for Bluetooth printers:', error);
		throw new Error(
			'Failed to scan for printers. Make sure Bluetooth is enabled.'
		);
	}
}
