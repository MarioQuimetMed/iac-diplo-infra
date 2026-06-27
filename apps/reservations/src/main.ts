import { NestFactory } from '@nestjs/core';
import { ReservationsModule } from './reservations.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DEFAULT_NATS_URL } from '@app/contracts';

async function bootstrap() {
  // 1. Crear la aplicación base HTTP
  const app = await NestFactory.create(ReservationsModule);

  // 2. Configurar validaciones globales para los DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 3. Conectar la capa asíncrona (NATS) como un microservicio híbrido
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || DEFAULT_NATS_URL],
    },
  });

  // 4. Iniciar ambos escuchas
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Reservations microservice is listening on port ${port} (HTTP) and connected to NATS`);
}
bootstrap();
