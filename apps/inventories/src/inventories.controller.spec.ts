import { Test, TestingModule } from '@nestjs/testing';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';

describe('InventoriesController', () => {
  let inventoriesController: InventoriesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoriesController],
      providers: [InventoriesService],
    }).compile();

    inventoriesController = app.get<InventoriesController>(InventoriesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(inventoriesController.getHello()).toBe('Hello World!');
    });
  });
});
