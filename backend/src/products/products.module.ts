import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
