/**
 * Bluetooth Printer Printing Utilities
 */

/**
 * Generate specialized print data based on printer name
 */
function generateSpecializedPrintData(
	content: string,
	printerName: string
): Uint8Array {
	console.log('Using specialized print data generator for:', printerName);
	const encoder = new TextEncoder();

	// AT POS thermal printer specific support
	if (
		printerName.toLowerCase().includes('at') ||
		printerName.toLowerCase().includes('pos') ||
		printerName.toLowerCase().includes('thermal')
	) {
		console.log('Using AT POS thermal printer format');
		return encoder.encode(content);
	}

	// Epson-specific commands
	if (printerName.toLowerCase().includes('epson')) {
		console.log('Using Epson-specific format');
		return encoder.encode(content);
	}

	// Star Micronics-specific
	if (printerName.toLowerCase().includes('star')) {
		console.log('Using Star Micronics format');
		return encoder.encode(
			content
				.replace('\x1B\x61\x01', '\x1B\x1D\x61\x01') // Center align
				.replace('\x1B\x61\x00', '\x1B\x1D\x61\x00') // Left align
				.replace('\x1D\x56\x42', '\x1B\x64\x02') // Cut paper
		);
	}

	// Generic implementation for unknown printers
	console.log('Using generic printer format');
	return encoder.encode(content);
}

/**
 * Prints content to a Bluetooth thermal printer with advanced service discovery
 */
export async function printToBluetooth(
	printerDevice: PrinterDevice,
	content: string
): Promise<boolean> {
	try {
		if (!printerDevice.bluetoothDevice) {
			throw new Error('No Bluetooth device available');
		}

		const device = printerDevice.bluetoothDevice;
		console.log('Starting print process with printer:', printerDevice.name);

		// Connect to the printer
		const server = await device.gatt?.connect();
		if (!server) {
			throw new Error('Could not connect to printer');
		}

		console.log('GATT connection successful, getting services...');

		// Generate specialized print data for this printer
		const printData = generateSpecializedPrintData(content, printerDevice.name);
		console.log('Print data prepared, size:', printData.length, 'bytes');

		// Try to find a service for sending data
		console.log('Discovering available services...');
		const services = await server.getPrimaryServices();
		console.log(`Found ${services.length} services`);

		// Common printer service UUIDs to try first (priority order)
		const priorityServiceUUIDs = [
			'49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service (highest priority)
			'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
			'0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
			'000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
			'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
			'00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
			'0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
			'0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
			'03b7e958-aed3-4d18-a30e-c6313ad7d9dd' // Another printer service
		];

		// Sort services to try priority ones first
		const sortedServices = [...services].sort((a, b) => {
			const aIsPriority = priorityServiceUUIDs.includes(a.uuid.toLowerCase());
			const bIsPriority = priorityServiceUUIDs.includes(b.uuid.toLowerCase());
			return bIsPriority ? 1 : aIsPriority ? -1 : 0;
		});

		let success = false;

		for (const service of sortedServices) {
			if (success) break;

			try {
				console.log(`Trying service: ${service.uuid}`);
				const characteristics = await service.getCharacteristics();
				console.log(
					`Found ${characteristics.length} characteristics for service ${service.uuid}`
				);

				// First try specific AT POS printer characteristic UUIDs
				const atPosCharUUIDs = [
					'49535343-8841-43f4-a8d4-ecbe34729bb3', // AT POS/ISSC write characteristic
					'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC UART write
					'0000ffe1-0000-1000-8000-00805f9b34fb', // Common BLE UART characteristic
					'0000fff1-0000-1000-8000-00805f9b34fb', // Common printer characteristic
					'0000ff01-0000-1000-8000-00805f9b34fb' // Another printer characteristic
				];

				// Try to find specific known characteristics first
				for (const charUUID of atPosCharUUIDs) {
					if (success) break;

					try {
						const specificChar = await service.getCharacteristic(charUUID);
						console.log(`Found specific characteristic: ${charUUID}`);

						if (
							specificChar.properties.write ||
							specificChar.properties.writeWithoutResponse
						) {
							try {
								console.log(
									`Writing to specific characteristic: ${specificChar.uuid}`
								);

								// Small test write first (printer initialization)
								const initSeq = new Uint8Array([0x1b, 0x40]); // ESC @ - Initialize printer
								await specificChar.writeValue(initSeq);
								console.log('Init sequence successfully sent');

								// Send the full print data in chunks
								const mtu = 512;
								if (printData.length <= mtu) {
									await specificChar.writeValue(printData);
								} else {
									for (
										let offset = 0;
										offset < printData.length;
										offset += mtu
									) {
										const chunk = printData.slice(offset, offset + mtu);
										console.log(
											`Sending chunk ${offset}-${offset + chunk.length} (${
												chunk.length
											} bytes)`
										);
										await specificChar.writeValue(chunk);
										await new Promise(resolve => setTimeout(resolve, 100));
									}
								}

								success = true;
								console.log('Successfully wrote to specific characteristic');
								break;
							} catch (writeError) {
								console.log(
									`Error writing to specific characteristic ${specificChar.uuid}:`,
									writeError
								);
							}
						}
					} catch {
						// Continue if this characteristic is not found
						console.log(
							`Specific characteristic ${charUUID} not found, trying others...`
						);
					}
				}

				// If specific characteristic approach didn't work, try all characteristics
				if (!success) {
					for (const characteristic of characteristics) {
						if (
							characteristic.properties.write ||
							characteristic.properties.writeWithoutResponse
						) {
							try {
								console.log(
									`Writing to characteristic: ${characteristic.uuid}`
								);

								const mtu = 512;
								if (printData.length <= mtu) {
									await characteristic.writeValue(printData);
									console.log('Write successful!');
									success = true;
								} else {
									console.log(
										`Data too large (${printData.length} bytes), sending in chunks of ${mtu} bytes`
									);
									for (
										let offset = 0;
										offset < printData.length;
										offset += mtu
									) {
										const chunk = printData.slice(offset, offset + mtu);
										console.log(
											`Sending chunk ${offset}-${offset + chunk.length} (${
												chunk.length
											} bytes)`
										);
										await characteristic.writeValue(chunk);
										await new Promise(resolve => setTimeout(resolve, 100));
									}
									console.log('All chunks sent successfully!');
									success = true;
								}
								break;
							} catch (writeError) {
								console.log(
									`Error writing to characteristic ${characteristic.uuid}:`,
									writeError
								);
							}
						}
					}
				}
			} catch (e) {
				console.log(`Error with service ${service.uuid}:`, e);
			}
		}

		// Disconnect from the device
		if (device.gatt?.connected) {
			device.gatt.disconnect();
			console.log('Disconnected from device');
		}

		if (!success) {
			throw new Error(
				'Could not find a way to send data to this printer. Please see console for details.'
			);
		}

		return true;
	} catch (error) {
		console.error('Error printing to Bluetooth printer:', error);
		throw error;
	}
}