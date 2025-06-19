import { Product } from '@prisma/client';

export interface CartItemResponse {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}
