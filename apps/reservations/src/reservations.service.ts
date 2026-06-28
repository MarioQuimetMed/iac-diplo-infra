import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { RESERVATION_REQUESTED_EVENT, ReservationRequestedEvent, NATS_SERVICE } from '@app/contracts';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    this.logger.log(`Creating reservation for room ${createReservationDto.roomId}...`);
    const reservation = this.reservationRepository.create({
      ...createReservationDto,
      status: ReservationStatus.PENDING,
    });

    const savedReservation = await this.reservationRepository.save(reservation);
    this.logger.log(`Reservation ${savedReservation.id} saved as PENDING. Emitting event to NATS...`);

    this.natsClient.emit<any, ReservationRequestedEvent>(RESERVATION_REQUESTED_EVENT, {
      reservationId: savedReservation.id,
      roomId: savedReservation.roomId,
      guestName: savedReservation.guestName,
      guestEmail: savedReservation.guestEmail,
      checkInDate: savedReservation.checkInDate,
      checkOutDate: savedReservation.checkOutDate,
    });

    return savedReservation;
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    this.logger.log(`Updating status of reservation ${id} to ${status}`);
    const reservation = await this.findOne(id);
    reservation.status = status;
    return this.reservationRepository.save(reservation);
  }
}
