import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationStatus } from './entities/reservation.entity';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const dto = {
        roomId: 'room-1',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        checkInDate: '2026-07-01',
        checkOutDate: '2026-07-05',
      };
      const expectedResult = { id: 'uuid-1', ...dto, status: ReservationStatus.PENDING };
      
      mockReservationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single reservation by id', async () => {
      const id = 'uuid-1';
      const expectedResult = { id, roomId: 'room-1', status: ReservationStatus.PENDING };

      mockReservationsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('handleReservationConfirmed', () => {
    it('should update reservation status to CONFIRMED on event', async () => {
      const payload = { reservationId: 'uuid-1' };

      await controller.handleReservationConfirmed(payload);

      expect(service.updateStatus).toHaveBeenCalledWith(payload.reservationId, ReservationStatus.CONFIRMED);
    });
  });
});
