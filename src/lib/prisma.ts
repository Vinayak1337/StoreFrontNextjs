import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
	// Configure connection pool for Vercel
	...(process.env.NODE_ENV === 'production' && {
		datasources: {
			db: {
				url: process.env.DATABASE_URL + '?connection_limit=1&pool_timeout=20&socket_timeout=20',
			},
		},
	}),
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
