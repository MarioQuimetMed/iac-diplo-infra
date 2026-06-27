import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule, NATS_SERVICE, DEFAULT_NATS_URL } from '@app/contracts';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL ?? DEFAULT_NATS_URL],
        },
      },
    ]),
    RedisModule,
    DatabaseModule.forRoot(),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
