"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const adminEmail = 'admin@shopie.com';
    const customerEmail = 'customer@shopie.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } });
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);
    const admin = existingAdmin ??
        (await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin User',
                password: adminPassword,
                role: 'ADMIN',
            },
        }));
    if (!existingCustomer) {
        await prisma.user.create({
            data: {
                email: customerEmail,
                name: 'Customer User',
                password: customerPassword,
                role: 'CUSTOMER',
            },
        });
    }
    const products = await prisma.product.findMany();
    if (products.length === 0) {
        await prisma.product.createMany({
            data: [
                {
                    name: 'Wireless Headphones',
                    description: 'Bluetooth over-ear headphones with noise cancellation.',
                    price: 79.99,
                    image: 'https://example.com/images/headphones.jpg',
                    quantity: 10,
                    adminId: admin.id,
                },
                {
                    name: 'Smart Watch',
                    description: 'Track your fitness and get notifications on the go.',
                    price: 59.99,
                    image: 'https://example.com/images/smartwatch.jpg',
                    quantity: 15,
                    adminId: admin.id,
                },
                {
                    name: 'Gaming Mouse',
                    description: 'Ergonomic RGB mouse with 6 programmable buttons.',
                    price: 29.99,
                    image: 'https://example.com/images/mouse.jpg',
                    quantity: 20,
                    adminId: admin.id,
                },
            ],
        });
    }
    console.log('✅ Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map