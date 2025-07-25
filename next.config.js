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
	}
};

module.exports = nextConfig;
