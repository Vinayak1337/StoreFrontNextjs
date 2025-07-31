/**
 * Bluetooth Printer Storage and State Management
 */

import { isBluetoothSupported } from './support';

interface NavigatorWithBluetooth extends Navigator {
	bluetooth?: {
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
}

interface PrinterDevice {
	id: string;
	name: string;
	bluetoothDevice?: BluetoothDevice;
	status: 'online' | 'offline' | 'unknown';
	type: 'bluetooth';
}

// Global state for connected printer
let globalConnectedPrinter: PrinterDevice | null = null;

/**
 * Save printer selection to both localStorage and cookies for cross-page consistency
 */
export function savePrinterForDirectUse(printerDevice: PrinterDevice): void {
	try {
		// Save to localStorage (for orders page)
		localStorage.setItem('thermal_printer_id', printerDevice.id);
		localStorage.setItem('thermal_printer_name', printerDevice.name);

		// Also save to cookies (for bills page compatibility)
		if (typeof document !== 'undefined') {
			document.cookie = `preferred_printer_id=${
				printerDevice.id
			}; expires=${new Date(
				Date.now() + 365 * 24 * 60 * 60 * 1000
			).toUTCString()}; path=/`;
			document.cookie = `preferred_printer_name=${
				printerDevice.name
			}; expires=${new Date(
				Date.now() + 365 * 24 * 60 * 60 * 1000
			).toUTCString()}; path=/`;
		}

		// Set as global printer
		setGlobalConnectedPrinter(printerDevice);

		console.log(
			'Printer saved for direct use across all pages:',
			printerDevice.name
		);
		console.log('Saved to localStorage and cookies');
	} catch (error) {
		console.error('Failed to save printer:', error);
	}
}

/**
 * Set the globally connected printer
 */
export function setGlobalConnectedPrinter(printer: PrinterDevice | null): void {
	globalConnectedPrinter = printer;
	console.log('Global printer set:', printer?.name || 'none');
}

/**
 * Get the globally connected printer
 */
export function getGlobalConnectedPrinter(): PrinterDevice | null {
	return globalConnectedPrinter;
}

/**
 * Auto-load saved printer on app start (no connection needed - already paired)
 */
export async function autoConnectToSavedPrinter(): Promise<boolean> {
	try {
		// Check if we already have a printer set
		if (globalConnectedPrinter) {
			console.log('Already have printer ready:', globalConnectedPrinter.name);
			return true;
		}

		// Try to get saved printer from localStorage first, then cookies as fallback
		let savedPrinterId = localStorage.getItem('thermal_printer_id');
		let savedPrinterName = localStorage.getItem('thermal_printer_name');

		// Fallback to cookies if localStorage is empty (bills page compatibility)
		if (!savedPrinterId && typeof document !== 'undefined') {
			const cookies = document.cookie.split(';').reduce((acc, cookie) => {
				const [key, value] = cookie.trim().split('=');
				acc[key] = value;
				return acc;
			}, {} as Record<string, string>);

			savedPrinterId = cookies['preferred_printer_id'];
			savedPrinterName = cookies['preferred_printer_name'];

			// If found in cookies, also save to localStorage for consistency
			if (savedPrinterId && savedPrinterName) {
				localStorage.setItem('thermal_printer_id', savedPrinterId);
				localStorage.setItem('thermal_printer_name', savedPrinterName);
				console.log('Migrated printer from cookies to localStorage');
			}
		}

		if (!savedPrinterId || !savedPrinterName) {
			console.log('No saved printer found');
			return false;
		}

		console.log('Loading saved printer for direct use:', savedPrinterName);

		// Use the browser's getDevices to find previously paired devices
		if (!isBluetoothSupported() || !(navigator as NavigatorWithBluetooth).bluetooth) {
			return false;
		}

		try {
			// Get available paired devices
			const availableDevices = await (navigator as NavigatorWithBluetooth).bluetooth?.getDevices?.();
			if (!availableDevices) {
				return false;
			}
			console.log('Available paired devices:', availableDevices);

			// Find our saved printer
			const matchedDevice = availableDevices.find(
				(device) => device.id === savedPrinterId
			);

			if (matchedDevice) {
				console.log('Found saved printer in paired devices:', matchedDevice);

				// Create printer device object - just set as available for direct use
				const printer: PrinterDevice = {
					id: matchedDevice.id,
					name: matchedDevice.name || savedPrinterName,
					bluetoothDevice: matchedDevice,
					status: 'online',
					type: 'bluetooth'
				};

				// Set as global printer for direct printing (no connection step)
				setGlobalConnectedPrinter(printer);
				console.log('Saved printer ready for direct printing:', printer.name);
				return true;
			} else {
				console.log(
					'Saved printer not found in paired devices, clearing saved data'
				);
				localStorage.removeItem('thermal_printer_id');
				localStorage.removeItem('thermal_printer_name');
				return false;
			}
		} catch (error) {
			console.error('Error getting paired devices:', error);
			return false;
		}
	} catch (error) {
		console.error('Error loading saved printer:', error);
		return false;
	}
}

/**
 * Validates Bluetooth printer configuration
 */
export function validatePrinterConfig(config: Partial<PrinterConfig>): boolean {
	if (!config.deviceId || !config.name) {
		return false;
	}

	// Check if type is bluetooth
	if (config.type !== 'bluetooth') {
		return false;
	}

	return true;
}