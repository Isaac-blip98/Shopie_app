import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const newAdminEmail = 'ndiranguelvis97@gmail.com';
  const adminPassword = await bcrypt.hash('admin123', 10);

  const existingOldAdmin = await prisma.user.findUnique({
    where: { email: 'admin@shopie.com' },
  });

  if (existingOldAdmin) {
    const productCount = await prisma.product.count({
      where: { adminId: existingOldAdmin.id },
    });

    if (productCount > 0) {
      console.log(`Old admin has ${productCount} product(s), but will be deleted (CASCADE enabled).`);
    }

    await prisma.user.delete({ where: { email: 'admin@shopie.com' } });
    console.log('Old admin deleted.');
  }

  const existingNewAdmin = await prisma.user.findUnique({
    where: { email: newAdminEmail },
  });

  const admin =
    existingNewAdmin ??
    (await prisma.user.create({
      data: {
        name: 'Elvis',
        email: newAdminEmail,
        password: adminPassword,
        role: 'ADMIN',
      },
    }));

  console.log('Admin ready:', admin.email);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
