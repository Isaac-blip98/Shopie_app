import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';
import { ProductResponse } from './interface/product-response.interface';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorators';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Roles('ADMIN', 'CUSTOMER')
  @Get()
  getAll(): Promise<ProductResponse[]> {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<ProductResponse> {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto, @Req() req): Promise<ProductResponse> {
    const adminId = req.user?.userId;
    return this.productService.createProduct( {...dto, adminId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string): Promise<ProductResponse> {
    return this.productService.deleteProduct(id);
  }
}
