import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItemResponse } from './interface/cart-item-response.interface';
import { JwtPayload } from 'src/auth/interfaces/auth.jwtpayload.interface';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCartItems(user: JwtPayload): Promise<CartItemResponse[]> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return cart?.items || [];
  }

  async addToCart(user: JwtPayload, dto: AddToCartDto): Promise<CartItemResponse> {
    const { productId, quantity } = dto;

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (product.quantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    let cart = await this.prisma.cart.findUnique({ where: { userId: user.userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId: user.userId } });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const updatedProductQty = product.quantity - quantity;

    if (existingItem) {

      await this.prisma.product.update({
        where: { id: productId },
        data: { quantity: updatedProductQty },
      });

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { quantity: updatedProductQty },
    });

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });
  }

  async updateCartItem(
    user: JwtPayload,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartItemResponse> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart.userId !== user.userId) throw new UnauthorizedException('Not your cart item');

    const quantityDiff = dto.quantity - item.quantity;

    const product = item.product;

    if (product.quantity < quantityDiff) {
      throw new BadRequestException('Not enough stock to increase quantity');
    }

    await this.prisma.product.update({
      where: { id: product.id },
      data: { quantity: product.quantity - quantityDiff },
    });

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

async removeCartItem(user: JwtPayload, cartItemId: string): Promise<void> {
  const item = await this.prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });

  if (!item) throw new NotFoundException('Cart item not found');
  if (item.cart.userId !== user.userId)
    throw new UnauthorizedException('Not your cart item');

  await this.prisma.product.update({
    where: { id: item.product.id },
    data: { quantity: item.product.quantity + 1 },
  });

  if (item.quantity > 1) {
    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: item.quantity - 1 },
    });
  } else {

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
}
}
