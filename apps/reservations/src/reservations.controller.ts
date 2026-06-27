import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from './entities/reservation.entity';
import { 
  RESERVATION_CONFIRMED_EVENT, 
  ReservationConfirmedEvent, 
  ROOM_UNAVAILABLE_EVENT, 
  RoomUnavailableEvent 
} from '@app/contracts';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Capa Síncrona (HTTP)
  
  @Post()
  async create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  // Capa Asíncrona (NATS)

  @EventPattern(RESERVATION_CONFIRMED_EVENT)
  async handleReservationConfirmed(@Payload() data: ReservationConfirmedEvent) {
    if (data.reservationId) {
      await this.reservationsService.updateStatus(
        data.reservationId,
        ReservationStatus.CONFIRMED,
      );
    }
  }

  @EventPattern(ROOM_UNAVAILABLE_EVENT)
  async handleRoomUnavailable(@Payload() data: RoomUnavailableEvent) {
    if (data.reservationId) {
      await this.reservationsService.updateStatus(
        data.reservationId,
        ReservationStatus.REJECTED,
      );
    }
  }
}
