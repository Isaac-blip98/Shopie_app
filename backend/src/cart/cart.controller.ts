import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import { CartItemResponse } from './interface/cart-item-response.interface';
import { JwtPayload } from 'src/auth/interfaces/auth.jwtpayload.interface';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<CartItemResponse[]> {
    const user = req.user as JwtPayload;
    return this.cartService.getCartItems(user);
  }

  @Post()
  addToCart(
    @Req() req: Request & { user?: JwtPayload },
    @Body() dto: AddToCartDto,
  ): Promise<CartItemResponse> {
    const user = req.user as JwtPayload;
    return this.cartService.addToCart(user, dto);
  }

  @Patch(':id')
  updateCartItem(
    @Req() req: Request & { user?: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartItemResponse> {
    const user = req.user as JwtPayload;
    return this.cartService.updateCartItem(user, id, dto);
  }

  @Delete(':id')
  removeItem(
    @Req() req: Request & { user?: JwtPayload },
    @Param('id') id: string,
  ): Promise<void> {
    const user = req.user as JwtPayload;
    return this.cartService.removeCartItem(user, id);
  }
}
