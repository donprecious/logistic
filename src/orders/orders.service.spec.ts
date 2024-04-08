import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotFoundException } from '@nestjs/common';
import { Order } from './interfaces/order.interface';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;

  beforeEach(async () => {
    // Mock for the document that should be returned by the new keyword
    const mockOrderDocument = {
      save: jest.fn(),
    };

    // Setting up the mock model to simulate the new keyword
    mockOrderModel = jest.fn().mockImplementation(() => mockOrderDocument);
    mockOrderModel.findById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken('Order'),
          useValue: mockOrderModel,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    it('should successfully create an order and return it', async () => {
      const createOrderDto: CreateOrderDto = {
        dropoff: {
          address: '123 Main St',
          city: 'Anytown',
          country: 'Country',
          email: 'test@example.com',
          name: 'Test Name',
          zipcode: '123456',
          phonenumber: '1234567890',
        },
        pickup: {
          address: '123 Main St',
          city: 'Anytown',
          country: 'Country',
          email: 'test@example.com',
          name: 'Test Name',
          zipcode: '123456',
          phonenumber: '1234567890',
        },
        packages: [{ height: 10, length: 10, width: 10, weight: 5 }],
      };

      // Specific mock setup for this test
      mockOrderModel().save.mockResolvedValue({
        ...createOrderDto,
        delivery_cost: 1.5, // Expected calculated cost
        current_status: 'CREATED',
        status_change_history: [],
      });

      const result = await service.createOrder(createOrderDto);
      expect(result.delivery_cost).toEqual(1.5);
      expect(result.current_status).toBe('CREATED');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);
      await expect(
        service.updateOrderStatus('1', { status: 'PICKED_UP' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update the status of an order if valid transition', async () => {
      const order = {
        _id: '1',
        current_status: 'CREATED',
        status_change_history: [],
        save: jest.fn().mockReturnThis(),
      };
      mockOrderModel.findById.mockResolvedValue(order);

      await service.updateOrderStatus('1', { status: 'PICKED_UP' });
      expect(order.current_status).toEqual('PICKED_UP');
      expect(order.save).toHaveBeenCalled(); // Ensures that save is called after updating the status
    });
  });
});
