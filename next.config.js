/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	experimental: {
		typedRoutes: false
	},
	// Override the default SSR behavior for specific paths
	reactStrictMode: true,
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true
	}
};

module.exports = nextConfig;
