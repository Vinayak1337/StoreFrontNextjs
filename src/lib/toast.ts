import { toast } from 'react-toastify';

// Export the toast functions directly
export { toast };

// Helper functions for common toast types
export const showSuccess = (message: string) => {
	toast.success(message);
};

export const showError = (message: string) => {
	toast.error(message);
};

export const showInfo = (message: string) => {
	toast.info(message);
};

export const showWarning = (message: string) => {
	toast.warning(message);
};
