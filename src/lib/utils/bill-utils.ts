import { Settings, Bill } from '@/types';

/**
 * Format a bill for printing with store settings
 */
export function formatBillForPrinting(bill: Bill, settings: Settings) {
	if (!bill || !bill.order) {
		return null;
	}

	const order = bill.order;
	const items = order.orderItems || [];

	// Calculate totals
	const totalAmount = bill.totalAmount;

	return {
		// Store information from settings
		storeInfo: {
			name: settings.storeName,
			address: settings.address,
			phone: settings.phone,
			email: settings.email,
			logo: settings.logo || '',
			footer: settings.footer || 'Thank you for your business!'
		},

		// Bill information
		billInfo: {
			id: bill.id,
			date: new Date(bill.createdAt).toLocaleDateString(),
			paymentMethod: bill.paymentMethod,
			isPaid: bill.isPaid || false
		},

		// Customer information
		customerInfo: {
			name: order.customerName
		},

		// Items information
		items: items.map(item => ({
			name: item.item?.name || 'Unknown Item',
			quantity: item.quantity,
			price: item.price,
			total: item.price * item.quantity
		})),

		// Totals
		totals: {
			currency: settings.currency,
			total: totalAmount
		}
	};
}

/**
 * Generate HTML for printing a bill
 */
export function generateBillHTML(bill: Bill, settings: Settings): string {
	const formattedBill = formatBillForPrinting(bill, settings);

	if (!formattedBill) {
		return '<div>No bill data available</div>';
	}

	return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        ${
					formattedBill.storeInfo.logo
						? `<img src="${formattedBill.storeInfo.logo}" alt="Logo" style="max-width: 200px; margin-bottom: 10px;" />`
						: ''
				}
        <h1 style="margin: 0; font-size: 24px;">${
					formattedBill.storeInfo.name
				}</h1>
        <p style="margin: 5px 0;">${formattedBill.storeInfo.address}</p>
        <p style="margin: 5px 0;">Tel: ${
					formattedBill.storeInfo.phone
				} | Email: ${formattedBill.storeInfo.email}</p>
      </div>
      
      <!-- Bill Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0 0 10px 0; font-size: 20px;">INVOICE</h2>
          <p style="margin: 5px 0;">Invoice #: ${formattedBill.billInfo.id}</p>
          <p style="margin: 5px 0;">Date: ${formattedBill.billInfo.date}</p>
          <p style="margin: 5px 0;">Payment Method: ${
						formattedBill.billInfo.paymentMethod
					}</p>
          <p style="margin: 5px 0;">Status: ${
						formattedBill.billInfo.isPaid ? 'PAID' : 'UNPAID'
					}</p>
        </div>
        <div>
          <h3 style="margin: 0 0 10px 0;">Customer</h3>
          <p style="margin: 5px 0;">${formattedBill.customerInfo.name}</p>
        </div>
      </div>
      
      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${formattedBill.items
						.map(
							item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
								item.name
							}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${
								item.quantity
							}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${
								formattedBill.totals.currency
							} ${Number(item.price).toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${
								formattedBill.totals.currency
							} ${Number(item.total).toFixed(2)}</td>
            </tr>
          `
						)
						.join('')}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div style="margin-left: auto; width: 300px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; border-top: 1px solid #ddd;">
          <span>Total:</span>
          <span>${formattedBill.totals.currency} ${Number(
		formattedBill.totals.total
	).toFixed(2)}</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
        <p>${formattedBill.storeInfo.footer}</p>
      </div>
    </div>
  `;
}

/**
 * Print a bill using the browser's print functionality
 */
export function printBill(bill: Bill, settings: Settings): void {
	const htmlContent = generateBillHTML(bill, settings);

	// Check if it's a Samsung tablet
	const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);

	// Samsung-optimized approach: create an iframe instead of a new window
	if (isSamsungBrowser) {
		// First remove any existing print frames
		const existingFrame = document.getElementById('print-frame');
		if (existingFrame) {
			document.body.removeChild(existingFrame);
		}

		// Create an iframe
		const printFrame = document.createElement('iframe');
		printFrame.id = 'print-frame';
		printFrame.name = 'print-frame';
		printFrame.style.position = 'fixed';
		printFrame.style.right = '0';
		printFrame.style.bottom = '0';
		printFrame.style.width = '0';
		printFrame.style.height = '0';
		printFrame.style.border = '0';
		document.body.appendChild(printFrame);

		// Write content to the iframe
		const frameWindow = printFrame.contentWindow;
		if (frameWindow) {
			const frameDoc = frameWindow.document;
			frameDoc.open();
			frameDoc.write(`
				<!DOCTYPE html>
				<html>
					<head>
						<title>Invoice #${bill.id}</title>
						<meta charset="utf-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1" />
						<style>
							@media print {
								body { 
									margin: 0;
									padding: 0;
								}
								@page {
									size: A4;
									margin: 10mm;
								}
							}
						</style>
					</head>
					<body>
						${htmlContent}
					</body>
				</html>
			`);
			frameDoc.close();

			// Use timeout to ensure content is fully loaded
			setTimeout(() => {
				try {
					frameWindow.focus();
					frameWindow.print();
				} catch (e) {
					console.error('Print error:', e);
					alert('There was an error when trying to print. Please try again.');
				}
			}, 1000);
		} else {
			console.error('Could not access iframe content window');
			alert('There was a problem preparing the print view. Please try again.');
		}

		return;
	}

	// Standard approach for other browsers
	// Create a new window for printing with optimized settings
	const printWindow = window.open(
		'',
		'_blank',
		'width=800,height=600,toolbar=0,menubar=0,location=0'
	);
	if (!printWindow) {
		alert('Please allow pop-ups to print the bill');
		return;
	}

	// Write the HTML to the new window
	printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${bill.id}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { 
            margin: 0;
            padding: 0;
          }
          @media print {
            body { 
              margin: 0;
              padding: 0;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          // Delay print to ensure content is fully loaded
          setTimeout(function() {
            window.print();
            // Close the window after printing with a longer timeout
            window.setTimeout(function() {
              window.close();
            }, 1000);
          }, 1000);
        </script>
      </body>
    </html>
  `);

	printWindow.document.close();
}

/**
 * Format bill content specifically for thermal printers
 * This creates a plain text representation that can be used with ESC/POS commands
 */
export const formatBillForThermalPrinter = (
	bill: Bill,
	settings: Settings
): string => {
	if (!bill || !settings) return '';

	// ESC/POS Commands
	const ESC = '\x1B'; // Escape character
	const GS = '\x1D'; // Group separator

	// Text formatting commands
	const CENTER = `${ESC}\x61\x01`; // Center alignment
	const LEFT = `${ESC}\x61\x00`; // Left alignment
	const BOLD_ON = `${ESC}E\x01`; // Bold on
	const BOLD_OFF = `${ESC}E\x00`; // Bold off
	const DOUBLE_WIDTH = `${GS}!\x01`; // Double width
	const NORMAL_WIDTH = `${GS}!\x00`; // Normal width
	const UNDERLINE_ON = `${ESC}-\x01`; // Underline on
	const UNDERLINE_OFF = `${ESC}-\x00`; // Underline off

	// Line feed and paper cut
	const LF = '\n'; // Line feed
	const DOUBLE_LF = '\n\n'; // Double line feed
	const INIT = `${ESC}@`; // Initialize printer
	const CUT = `${GS}V\x42\x00`; // Cut paper command

	// Format the bill content with ESC/POS commands
	let content = INIT;

	// Store name and header
	content += CENTER + BOLD_ON + DOUBLE_WIDTH;
	content += settings.storeName + LF;
	content += NORMAL_WIDTH;
	content += settings.address + LF;
	content += settings.phone + LF;

	if (settings.email) {
		content += settings.email + LF;
	}

	// Bill header
	content += UNDERLINE_ON + `Invoice #: ${bill.id}` + UNDERLINE_OFF + LF;
	content += `Date: ${new Date(bill.createdAt).toLocaleDateString()}` + LF;
	content += `Customer: ${bill.order?.customerName || 'Walk-in'}` + LF;

	content += LEFT + BOLD_OFF + DOUBLE_LF;

	// Items header
	content +=
		BOLD_ON + 'ITEM                QTY    PRICE    TOTAL' + BOLD_OFF + LF;
	content += '-----------------------------------------' + LF;

	// Items
	if (bill.order?.orderItems) {
		bill.order.orderItems.forEach(item => {
			const itemName = item.item?.name?.length
				? item.item.name.length > 16
					? item.item.name.substring(0, 15) + '.'
					: item.item.name.padEnd(16, ' ')
				: 'Unknown Item'.padEnd(16, ' ');

			const qty = String(item.quantity).padStart(3, ' ');
			const price = String(Number(item.price || 0).toFixed(2)).padStart(8, ' ');
			const total = String(
				Number((item.price || 0) * item.quantity).toFixed(2)
			).padStart(8, ' ');

			content += itemName + ' ' + qty + ' ' + price + ' ' + total + LF;
		});
	}

	content += '-----------------------------------------' + LF;

	// Totals
	const subtotal = Number(bill.totalAmount) - Number(bill.taxes || 0);

	content += LEFT;
	content +=
		`Subtotal:${' '.repeat(25)}${settings.currency || 'INR'} ${subtotal.toFixed(
			2
		)}` + LF;

	if (bill.taxes && Number(bill.taxes) > 0) {
		content +=
			`Tax:${' '.repeat(30)}${settings.currency || 'INR'} ${Number(
				bill.taxes
			).toFixed(2)}` + LF;
	}

	content += BOLD_ON;
	content +=
		`TOTAL:${' '.repeat(28)}${settings.currency || 'INR'} ${Number(
			bill.totalAmount
		).toFixed(2)}` + LF;
	content += BOLD_OFF;

	// Payment method
	content += `Payment: ${bill.paymentMethod || 'Cash'}` + DOUBLE_LF;

	// Footer
	content += CENTER;
	content += (settings.footer || 'Thank you for your business!') + DOUBLE_LF;

	// Add extra spacing before cutting
	content += LF + LF + LF; // Add 3 extra line feeds for spacing

	// Cut the paper
	content += CUT;

	return content;
};
