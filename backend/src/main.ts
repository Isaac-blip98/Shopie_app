import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Shopie API')
    .setDescription('The Shopie store API documentation')
    .setVersion('1.0')
    .addBearerAuth() // Enables JWT auth support in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
console.log(`Swagger docs available at: http://localhost:3000/api`);
}
bootstrap();
