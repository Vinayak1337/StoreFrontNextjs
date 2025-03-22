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

	// Create a new window for printing
	const printWindow = window.open('', '_blank');
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
          // Automatically print when the page loads
          window.onload = function() {
            window.print();
            // Close the window after printing
            window.setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

	printWindow.document.close();
}
