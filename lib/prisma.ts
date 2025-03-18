'use client';

// Mock Prisma client for development
const mockPrismaClient = {
	item: {
		findMany: async () => [],
		findUnique: async () => null,
		create: async data => data.data,
		update: async data => data.data,
		delete: async () => ({})
	},
	order: {
		findMany: async () => [],
		findUnique: async () => null,
		create: async data => data.data,
		update: async data => data.data
	},
	bill: {
		findMany: async () => [],
		findUnique: async () => null,
		create: async data => data.data,
		update: async data => data.data,
		delete: async () => ({})
	}
};

export const prisma = mockPrismaClient;

export default mockPrismaClient;
