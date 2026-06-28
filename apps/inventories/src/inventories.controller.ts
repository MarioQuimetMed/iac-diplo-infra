import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoriesService } from './inventories.service';
import { RESERVATION_REQUESTED_EVENT, ReservationRequestedEvent } from '@app/contracts';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post('rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.inventoriesService.createRoom(createRoomDto);
  }

  @EventPattern(RESERVATION_REQUESTED_EVENT)
  async handleReservationRequested(@Payload() data: ReservationRequestedEvent) {
    await this.inventoriesService.handleReservationRequested(data);
  }
}
