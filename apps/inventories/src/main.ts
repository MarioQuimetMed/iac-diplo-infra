import { NestFactory } from '@nestjs/core';
import { InventoriesModule } from './inventories.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DEFAULT_NATS_URL } from '@app/contracts';

async function bootstrap() {
  const app = await NestFactory.create(InventoriesModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || DEFAULT_NATS_URL],
    },
  });

  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3001; 
  await app.listen(port);
  console.log(`Inventories microservice is listening on port ${port} (HTTP) and connected to NATS`);
}
bootstrap();
