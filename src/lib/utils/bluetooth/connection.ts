/**
 * Bluetooth Printer Connection Utilities
 */

/**
 * Attempts to connect to a specific Bluetooth printer
 */
export async function connectToPrinter(
	printerDevice: PrinterDevice
): Promise<boolean> {
	try {
		if (!printerDevice.bluetoothDevice) {
			throw new Error('No Bluetooth device available for connection');
		}

		const device = printerDevice.bluetoothDevice;

		// Connect to the Bluetooth device
		const server = await device.gatt?.connect();
		if (!server) {
			throw new Error(
				`Failed to establish GATT connection with printer ${printerDevice.name}`
			);
		}

		// Verify connection is established
		if (!server.connected) {
			throw new Error(
				`Connection to printer ${printerDevice.name} was not successful`
			);
		}

		return true;
	} catch (error) {
		console.error(
			`Bluetooth printer connection failed for ${printerDevice.name}:`,
			error
		);
		throw error;
	}
}

/**
 * Tests Bluetooth printer connection by sending a test print
 */
export async function testPrinter(
	printerDevice: PrinterDevice
): Promise<boolean> {
	try {
		if (!printerDevice.bluetoothDevice) {
			throw new Error('No Bluetooth device available for testing');
		}

		const device = printerDevice.bluetoothDevice;

		// Connect to the device if not already connected
		const server = await device.gatt?.connect();
		if (!server) {
			throw new Error('Failed to connect to printer for testing');
		}

		// Try to find services and characteristics
		const services = await server.getPrimaryServices();

		let testSuccessful = false;
		for (const service of services) {
			try {
				const characteristics = await service.getCharacteristics();

				// Find a writable characteristic
				for (const characteristic of characteristics) {
					if (
						characteristic.properties.write ||
						characteristic.properties.writeWithoutResponse
					) {
						// Send a simple test command (line feed)
						const testData = new TextEncoder().encode(
							'\n\n--- Test Print ---\n\n'
						);
						await characteristic.writeValue(testData);
						testSuccessful = true;
						break;
					}
				}

				if (testSuccessful) break;
			} catch (e) {
				// Continue trying other services
				console.log('Service test failed, trying next service:', e);
			}
		}

		// Disconnect after test
		if (device.gatt?.connected) {
			device.gatt.disconnect();
		}

		if (!testSuccessful) {
			throw new Error('Could not find a way to send test data to printer');
		}

		return true;
	} catch (error) {
		console.error('Bluetooth printer test failed:', error);
		throw error;
	}
}

/**
 * Auto-connects to printer if auto-connect is enabled and printer config exists
 * Note: Bluetooth auto-connect is limited due to browser security restrictions
 */
export async function autoConnectPrinter(): Promise<boolean> {
	try {
		// Bluetooth devices cannot be auto-connected due to browser security restrictions
		// User must manually initiate the connection through the UI
		console.log(
			'Auto-connect is not supported for Bluetooth printers due to browser security restrictions'
		);
		return false;
	} catch (error) {
		console.error('Auto-connect failed:', error);
		return false;
	}
}

/**
 * Gets Bluetooth printer status
 */
export async function getPrinterStatus(
	printerDevice: PrinterDevice
): Promise<'online' | 'offline' | 'error'> {
	try {
		if (!printerDevice.bluetoothDevice) {
			return 'error';
		}

		const device = printerDevice.bluetoothDevice;

		// Check if device is already connected
		if (device.gatt?.connected) {
			return 'online';
		}

		// Try to connect briefly to check status
		try {
			const server = await device.gatt?.connect();
			if (server && server.connected) {
				// Disconnect immediately after checking
				device.gatt?.disconnect();
				return 'online';
			}
		} catch (error) {
			console.log('Connection test failed:', error);
			return 'offline';
		}

		return 'offline';
	} catch (error) {
		console.error('Failed to get Bluetooth printer status:', error);
		return 'error';
	}
}