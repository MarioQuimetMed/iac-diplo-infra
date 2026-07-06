import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { OrdersModule } from './orders.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  app.enableCors(); // Habilita CORS para todos los orígenes por defecto

  const port = Number(process.env.ORDERS_HTTP_PORT ?? 3000);

  await app.listen(port);
  Logger.log(`orders HTTP escuchando en http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
