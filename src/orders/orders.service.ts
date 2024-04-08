import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { Order } from './interfaces/order.interface';
import { InjectModel } from '@nestjs/mongoose';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel('Order') private orderModel: Model<Order>) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { dropoff, pickup, packages } = createOrderDto;

    // Calculate the total price
    let totalPrice = 0;
    for (const pkg of packages) {
      const volume = pkg.height * pkg.length * pkg.width; // Calculate the volume
      const volumeCharge = Math.floor(volume / 5000) * 0.5; // €0.50 for every 5000 cubic units

      // // If the volume of a package is greater than 5000 cubic units
      // if (volume > 5000) {
      //   // Calculate how many 5000-unit increments are in the volume above the first 5000 units
      //   volumeCharge = Math.floor((volume - 5000) / 5000) * 0.50;
      // }
      const weightCharge = pkg.weight * 0.1; // €0.10 per kilogram of weight

      totalPrice += 1 + volumeCharge + weightCharge; // Each package costs €1, plus volume and weight charges
    }

    const newOrder = new this.orderModel({
      ...createOrderDto,
      delivery_cost: totalPrice,
      current_status: 'CREATED',
      status_change_history: [],
    });

    return newOrder.save();
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const newStatus = updateOrderStatusDto.status;

    // State machine validation
    const validTransitions = {
      CREATED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['DELIVERED', 'RETURNING'],
      RETURNING: ['RETURNED'],
    };
    const allowedStatuses = validTransitions[order.current_status] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${order.current_status} to ${newStatus}.`,
      );
    }
    if (['CANCELLED', 'DELIVERED', 'RETURNED'].includes(newStatus)) {
      throw new BadRequestException(
        `Status ${newStatus} is final and cannot be changed.`,
      );
    }

    order.current_status = newStatus;
    order.status_change_history.push({
      from_status: order.current_status,
      to_status: newStatus,
      date: new Date(),
    });

    return order.save();
  }

  async search(address?: string, postalCode?: string): Promise<Order[]> {
    if (!address && !postalCode) {
      throw new BadRequestException(
        'Either address or postal code must be provided',
      );
    }

    const query: FilterQuery<Order> = {};
    if (address) {
      query['dropoff.address'] = { $regex: new RegExp(address, 'i') }; // Case-insensitive partial match
    }
    if (postalCode) {
      query['dropoff.zipcode'] = postalCode; // Exact match
    }
    return this.orderModel.find(query).exec();
  }
}
