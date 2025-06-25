import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/auth/interfaces/auth.jwtpayload.interface';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CartItemResponse } from './interface/cart-item-response.interface';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCartItems(user: JwtPayload): Promise<CartItemResponse[]> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.userId },
      include: { items: { include: { product: true } } },
    });
    return cart?.items ?? [];
  }

  async addToCart(
    user: JwtPayload,
    { productId, quantity }: AddToCartDto,
  ): Promise<CartItemResponse> {
    if (quantity < 1)
      throw new BadRequestException('Quantity must be at least 1');

    return this.prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');
      if (product.quantity < quantity)
        throw new BadRequestException('Not enough stock available');

      const cart =
        (await tx.cart.findUnique({ where: { userId: user.userId } })) ??
        (await tx.cart.create({ data: { userId: user.userId } }));

      const existingItem = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      await tx.product.update({
        where: { id: productId },
        data: { quantity: product.quantity - quantity },
      });

      return existingItem
        ? tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
            include: { product: true },
          })
        : tx.cartItem.create({
            data: { cartId: cart.id, productId, quantity },
            include: { product: true },
          });
    });
  }

  async updateCartItem(
    user: JwtPayload,
    cartItemId: string,
    { quantity }: UpdateCartItemDto,
  ): Promise<CartItemResponse> {
    if (quantity < 1)
      throw new BadRequestException('Quantity must be at least 1');

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true, product: true },
      });
      if (!item) throw new NotFoundException('Cart item not found');
      if (item.cart.userId !== user.userId)
        throw new UnauthorizedException('Not your cart item');

      const diff = quantity - item.quantity; 
      const product = item.product;

      if (diff > 0 && product.quantity < diff)
        throw new BadRequestException('Not enough stock to increase quantity');

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: product.quantity - diff }, 
      });

      return tx.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: { product: true },
      });
    });
  }

  async removeCartItem(
    user: JwtPayload,
    cartItemId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true, product: true },
      });
      if (!item) throw new NotFoundException('Cart item not found');
      if (item.cart.userId !== user.userId)
        throw new UnauthorizedException('Not your cart item');

      /* Restore exact quantity to stock */
      await tx.product.update({
        where: { id: item.product.id },
        data: { quantity: item.product.quantity + item.quantity },
      });

      /* Delete cart item */
      await tx.cartItem.delete({ where: { id: cartItemId } });
    });
  }
}
