import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { Room } from './entities/room.entity';
import { RoomBlock } from './entities/room-block.entity';
import { DatabaseModule } from '@app/database';
import { NATS_SERVICE, DEFAULT_NATS_URL } from '@app/contracts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Room, RoomBlock]),
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.get<string>('NATS_URL') || DEFAULT_NATS_URL],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [InventoriesController],
  providers: [InventoriesService],
})
export class InventoriesModule {}
