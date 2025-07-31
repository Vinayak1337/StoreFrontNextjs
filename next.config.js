/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	compiler: {
		styledComponents: true
	},
	webpack: (config) => {
		config.watchOptions = {
			...config.watchOptions,
			ignored: ['**/project-manager-master/**']
		};
		return config;
	},
	experimental: {
		turbo: {
			rules: {
				'**/project-manager-master/**': {
					loaders: [],
				}
			}
		}
	},
	serverExternalPackages: ['@prisma/client', 'prisma'],
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
