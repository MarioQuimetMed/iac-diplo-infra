import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Room } from './entities/room.entity';
import { RoomBlock } from './entities/room-block.entity';
import { 
  NATS_SERVICE, 
  ReservationRequestedEvent, 
  RESERVATION_CONFIRMED_EVENT, 
  ROOM_UNAVAILABLE_EVENT 
} from '@app/contracts';

@Injectable()
export class InventoriesService {
  private readonly logger = new Logger(InventoriesService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomBlock)
    private readonly roomBlockRepo: Repository<RoomBlock>,
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  async createRoom(createRoomDto: any) {
    this.logger.log(`Creating room ${createRoomDto.roomNumber}...`);
    const room = this.roomRepo.create(createRoomDto);
    return await this.roomRepo.save(room);
  }

  async handleReservationRequested(payload: ReservationRequestedEvent) {
    this.logger.log(`Processing reservation requested event for reservation ${payload.reservationId}`);
    
    const { reservationId, roomId, checkInDate, checkOutDate } = payload;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Verify room exists
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) {
      this.logger.warn(`Room ${roomId} not found for reservation ${reservationId}`);
      this.natsClient.emit(ROOM_UNAVAILABLE_EVENT, { reservationId });
      return;
    }

    // Check overlap
    const overlappingBlock = await this.roomBlockRepo.createQueryBuilder('block')
      .where('block.roomId = :roomId', { roomId })
      .andWhere('block.startDate < :checkOutDate', { checkOutDate: checkOut })
      .andWhere('block.endDate > :checkInDate', { checkInDate: checkIn })
      .getOne();

    if (overlappingBlock) {
      this.logger.warn(`Room ${roomId} is unavailable for dates ${checkInDate} to ${checkOutDate}. Reservation ${reservationId} rejected.`);
      this.natsClient.emit(ROOM_UNAVAILABLE_EVENT, { reservationId });
    } else {
      this.logger.log(`Room ${roomId} is available. Blocking dates for reservation ${reservationId}.`);
      
      const newBlock = this.roomBlockRepo.create({
        room,
        startDate: checkIn,
        endDate: checkOut,
      });
      await this.roomBlockRepo.save(newBlock);

      this.natsClient.emit(RESERVATION_CONFIRMED_EVENT, { reservationId });
    }
  }
}
