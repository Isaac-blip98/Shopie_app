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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';
import { ProductResponse } from './interface/product-response.interface';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorators';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productService: ProductsService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductDto,
    @Req() req: any,
  ) {
    const upload = file ? await this.cloudinaryService.uploadImage(file) : null;

    const price = body.price ? parseFloat(body.price as any) : 0;
    const quantity = body.quantity ? parseInt(body.quantity as any, 10) : 0;

    return this.productService.createProduct({
      ...body,
      price,
      quantity,
      image: upload?.secure_url || '',
      adminId: req.user?.userId,
    });
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
