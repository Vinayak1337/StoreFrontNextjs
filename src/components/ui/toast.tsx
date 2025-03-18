'use client';

import * as React from 'react';
import { toast as reactToastify, ToastOptions } from 'react-toastify';

// Export react-toastify types for backward compatibility
type ToastProps = ToastOptions;

// Basic action element type for backward compatibility
type ToastActionElement = React.ReactElement;

// Export reusable toast functions for easy access
const toast = reactToastify;

// Export types for backward compatibility
export { type ToastProps, type ToastActionElement, toast };
