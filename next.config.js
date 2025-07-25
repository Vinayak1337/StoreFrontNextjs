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
	// Configure Turbopack to match webpack settings
	turbo: {
		rules: {
			'**/project-manager-master/**': {
				loaders: [],
			}
		}
	},
	// Ensure Prisma works on Vercel
	serverExternalPackages: ['@prisma/client', 'prisma'],
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
