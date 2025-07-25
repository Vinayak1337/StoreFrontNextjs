/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	reactStrictMode: true,
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true
	},
	// Exclude project-manager-master from compilation
	webpack: (config) => {
		config.watchOptions = {
			...config.watchOptions,
			ignored: ['**/project-manager-master/**']
		};
		return config;
	},
	// Vercel-specific optimizations
	experimental: {
		// Enable faster builds
		optimizePackageImports: ['@prisma/client'],
	},
	// API route optimizations
	async headers() {
		return [
			{
				source: '/api/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
					{
						key: 'Connection',
						value: 'close',
					}
				],
			},
		];
	}
};

module.exports = nextConfig;
