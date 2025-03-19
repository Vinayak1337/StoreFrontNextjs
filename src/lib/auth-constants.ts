// Authentication constants

// Session types
export const SESSION_TYPES = {
	PROD: 'production',
	DEV: 'development'
};

// Cookie name for manager session
export const COOKIE_NAME = process.env.NODE_ENV + '-store-manager';
