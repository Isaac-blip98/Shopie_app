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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';
import { ProductResponse } from './interface/product-response.interface';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorators';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('search')
  search(@Query('q') query?: string): Promise<ProductResponse[]> {
    if (!query || query.trim() === '') {
      return this.productService.getAllProducts();
    }
    return this.productService.searchProducts(query);
  }

  @Get('filter')
  filterProducts(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minQty') minQty?: string,
    @Query('maxQty') maxQty?: string,
  ): Promise<ProductResponse[]> {
    return this.productService.filterProducts({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minQty: minQty ? parseInt(minQty) : undefined,
      maxQty: maxQty ? parseInt(maxQty) : undefined,
    });
  }

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
    return this.productService.createProduct({ ...dto, adminId });
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
