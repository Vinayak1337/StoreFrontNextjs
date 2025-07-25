import prisma from './prisma';
import bcrypt from 'bcrypt';

async function seedUser() {
	// Check if we already have a user
	const existingUser = await prisma.user.findFirst();

	if (existingUser) {
		console.log('User already exists, skipping user seed.');
		return;
	}

	// Create the store manager user
	const hashedPassword = await bcrypt.hash('password123', 10);

	await prisma.user.create({
		data: {
			name: 'StoreFront Manager',
			email: 'manager@storefront.com',
			password: hashedPassword
		}
	});

	console.log('Created store manager user');
}

export async function seed() {
	try {
		await seedUser();
		// Other seed functions could be called here

		console.log('Seed completed successfully');
	} catch (error) {
		console.error('Error during seed:', error);
	}
}

// Run the seed if this file is executed directly
if (require.main === module) {
	seed();
}
