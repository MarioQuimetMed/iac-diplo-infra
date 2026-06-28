import { Test, TestingModule } from '@nestjs/testing';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';

describe('InventoriesController', () => {
  let controller: InventoriesController;
  let service: InventoriesService;

  beforeEach(async () => {
    const mockService = {
      createRoom: jest.fn(),
      handleReservationRequested: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoriesController],
      providers: [
        {
          provide: InventoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InventoriesController>(InventoriesController);
    service = module.get<InventoriesService>(InventoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRoom', () => {
    it('should call inventoriesService.createRoom with correct params', async () => {
      const createRoomDto = { roomNumber: '101', type: 'single', isActive: true };
      
      (service.createRoom as jest.Mock).mockResolvedValue({ id: 'uuid-123', ...createRoomDto });
      
      const result = await controller.createRoom(createRoomDto);
      
      expect(service.createRoom).toHaveBeenCalledWith(createRoomDto);
      expect(result).toEqual({ id: 'uuid-123', ...createRoomDto });
    });
  });

  describe('handleReservationRequested', () => {
    it('should call inventoriesService.handleReservationRequested with payload', async () => {
      const payload = { 
        reservationId: 'res-id', 
        roomId: 'room-id', 
        guestName: 'John', 
        guestEmail: 'j@e.com', 
        checkInDate: '2026-07-01', 
        checkOutDate: '2026-07-05' 
      };
      
      await controller.handleReservationRequested(payload);
      
      expect(service.handleReservationRequested).toHaveBeenCalledWith(payload);
    });
  });
});
