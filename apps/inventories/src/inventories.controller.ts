import { Controller, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoriesService } from './inventories.service';
import { RESERVATION_REQUESTED_EVENT, ReservationRequestedEvent } from '@app/contracts';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post('seed')
  async seed() {
    return this.inventoriesService.seedRooms();
  }

  @EventPattern(RESERVATION_REQUESTED_EVENT)
  async handleReservationRequested(@Payload() data: ReservationRequestedEvent) {
    await this.inventoriesService.handleReservationRequested(data);
  }
}
