import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductResponse } from './interface/product-response.interface';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
    adminId: string;
  }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        quantity: data.quantity,
        admin: {
          connect: {
            id: data.adminId,
          },
        },
      },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async searchProducts(query: string) {
  return this.prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

  async updateProduct(
    id: string,
    data: Partial<Omit<Parameters<typeof this.createProduct>[0], 'adminId'>>,
  ) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async filterProducts(filters: {
  minPrice?: number;
  maxPrice?: number;
  minQty?: number;
  maxQty?: number;
}): Promise<ProductResponse[]> {
  const { minPrice, maxPrice, minQty, maxQty } = filters;

  return this.prisma.product.findMany({
    where: {
      AND: [
        minPrice !== undefined ? { price: { gte: minPrice } } : {},
        maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
        minQty !== undefined ? { quantity: { gte: minQty } } : {},
        maxQty !== undefined ? { quantity: { lte: maxQty } } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

}
