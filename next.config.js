/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	reactStrictMode: true,
	compiler: {
		// Enables the styled-components SWC transform
		styledComponents: true
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Don't bundle server-only packages on the client
			config.resolve.fallback = {
				...config.resolve.fallback,
				bcrypt: false
			};
		}

		return config;
	}
};

module.exports = nextConfig;
