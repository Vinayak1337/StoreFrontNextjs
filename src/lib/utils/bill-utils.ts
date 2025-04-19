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
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${Number(
								item.price
							).toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${Number(
								item.total
							).toFixed(2)}</td>
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
          <span>${Number(formattedBill.totals.total).toFixed(2)}</span>
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
	const DOUBLE_SIZE = `${ESC}!\x30`; // Double width & height
	const NORMAL_SIZE = `${ESC}!\x00`; // Normal size

	// Line feed and paper cut
	const LF = '\n'; // Line feed
	const INIT = `${ESC}@`; // Initialize printer
	const CUT = `${GS}V\x42\x00`; // Cut paper command

	// Receipt constants
	// For 58mm thermal printers (common width is 32-36 chars)
	const WIDTH = 32; // Total width of paper in characters
	const SEPARATOR = '-'.repeat(WIDTH);

	// Column widths for perfect alignment
	// The total must sum to WIDTH (32 characters)
	const COLS = {
		item: 14, // 14 chars for item name
		qty: 4, // 4 chars for quantity
		rate: 6, // 6 chars for rate/price (up to "999.99")
		amount: 8 // 8 chars for amount/total (up to "99999.99" or "999999")
	};

	// Helper function to format a number with NO currency symbol
	function money(n: number): string {
		return n % 1 === 0 ? String(n) : n.toFixed(2); // "125" or "125.50"
	}

	// Helper function to create a perfectly aligned row
	const row = (
		item: string,
		qty: string,
		rate: string,
		amount: string
	): string => {
		return (
			item.padEnd(COLS.item).slice(0, COLS.item) + // clamp name
			qty.padStart(COLS.qty) +
			rate.padStart(COLS.rate) +
			amount.padStart(COLS.amount) +
			LF
		);
	};

	// Helper function to create right-aligned data with label
	const dataRow = (label: string, value: string): string => {
		return label + ' '.repeat(WIDTH - label.length - value.length) + value + LF;
	};

	// Format the bill content with ESC/POS commands
	let content = INIT;

	// Store branding and header (centered, prominent)
	content += CENTER + BOLD_ON + DOUBLE_SIZE;
	content += settings.storeName.toUpperCase() + LF; // BIG & BOLD
	content += NORMAL_SIZE;
	content += settings.address + LF;
	content += `${settings.phone}` + LF;
	if (settings.email) {
		content += settings.email + LF;
	}

	content += SEPARATOR + LF;

	// Bill header - improved date format for India (DD-MM-YYYY)
	const createdDate = new Date(bill.createdAt);
	const formattedDate = `${String(createdDate.getDate()).padStart(
		2,
		'0'
	)}-${String(createdDate.getMonth() + 1).padStart(
		2,
		'0'
	)}-${createdDate.getFullYear()}`;
	const formattedTime = `${String(createdDate.getHours()).padStart(
		2,
		'0'
	)}:${String(createdDate.getMinutes()).padStart(2, '0')} (IST)`;

	// Invoice number and date on separate lines to avoid collision
	content += LEFT;
	content += dataRow('Invoice# ' + bill.id.slice(0, 6), '');
	content += dataRow('Date', formattedDate + ' ' + formattedTime);

	// Customer on separate line (not cashier)
	const cashier = bill.order?.customerName?.split(' ')[0] || 'Customer';
	content += dataRow('Customer: ' + cashier, '');
	content += LF; // Extra line before separator

	content += SEPARATOR + LF;

	// Items header - fixed column widths for proper alignment
	content += BOLD_ON;
	content += row('ITEM'.padEnd(COLS.item), 'QTY', 'RATE', 'AMT');
	content += BOLD_OFF;

	// Items with precise column alignment
	if (bill.order?.orderItems) {
		bill.order.orderItems.forEach(item => {
			// Item name - truncating as needed
			const itemName = item.item?.name || 'Unknown';

			// Price without currency symbol
			const price = Number(item.price || 0);
			const priceStr = money(price);

			// Total amount without currency symbol
			const total = price * item.quantity;
			const totalStr = money(total);

			content += row(itemName, String(item.quantity), priceStr, totalStr);
		});
	}

	content += SEPARATOR + LF;

	// Total with prominent formatting (no subtotal needed since taxes were removed)
	content += BOLD_ON;
	content += dataRow('TOTAL', money(Number(bill.totalAmount)));
	content += BOLD_OFF;

	// Payment method
	content += `Paid by: ${bill.paymentMethod.toUpperCase() || 'CASH'}` + LF;

	content += LF + SEPARATOR + LF;

	// Footer with thank you message - centered
	content += CENTER + BOLD_ON;
	content += 'Thank you for shopping with us!' + LF;
	content += BOLD_OFF;
	content +=
		'Visit again' + (settings.footer ? ` - ${settings.footer}` : '') + LF;

	// Add more spacing before cutting
	content += LF + LF + LF + LF;

	// Cut the paper
	content += CUT;

	return content;
};
