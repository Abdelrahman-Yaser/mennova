import { Controller, Get, Param, Delete, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
  @Post('addOrder')
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = this.ordersService.createOrder(dto);
    return order;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
