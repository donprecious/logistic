import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @ApiQuery({
    name: 'address',
    required: false,
    description: 'Partial match for dropoff address',
    type: String,
  })
  @ApiQuery({
    name: 'postalCode',
    required: false,
    description: 'Exact match for dropoff postal code',
    type: String,
  })
  @Get('/search')
  searchOrders(
    @Query('address') address?: string,
    @Query('postalCode') postalCode?: string,
  ) {
    return this.ordersService.search(address, postalCode);
  }
}
