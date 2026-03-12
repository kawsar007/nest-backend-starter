import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('Admin@123456', saltRounds);

  // Seed super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'superadmin',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Seed a regular user
  const userPassword = await bcrypt.hash('User@123456', saltRounds);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'regularuser',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Seeding complete!');
  console.log(`   Admin: ${admin.email}`);
  console.log(`   User:  ${user.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
