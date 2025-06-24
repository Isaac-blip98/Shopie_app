import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule], 
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
