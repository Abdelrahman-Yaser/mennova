import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { DataSource } from 'typeorm';
import { RedisService } from './../../redis/redis.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService, // استخدمنا ioredis
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const result = await this.dataSource.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        customername: createOrderDto.customerName,
        customeremail: createOrderDto.customerEmail,
        customerphone: createOrderDto.customerPhone,
      });

      const savedOrder = await manager.save(order);

      for (const item of createOrderDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product)
          throw new NotFoundException(`Product ${item.productId} not found`);
        if (product.stock_quantity < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${product.id}`,
          );
        }

        product.stock_quantity -= item.quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: item.price,
        });

        await manager.save(orderItem);
      }
      return savedOrder;
    });

    // مسح الكاش بعد اضافة طلب
    await this.redisService.del('all_orders');

    return result;
  }

  async findAll() {
    const cacheKey = 'all_orders';
    const cachedOrders = await this.redisService.get<OrderEntity[]>(cacheKey);

    if (cachedOrders) return cachedOrders;

    const orders = await this.dataSource.getRepository(OrderEntity).find({
      relations: ['items'],
    });

    await this.redisService.set(cacheKey, orders, 300); // TTL 5 دقائق

    return orders;
  }

  async findOne(id: number) {
    const cacheKey = `order_${id}`;
    const cachedOrder = await this.redisService.get<OrderEntity>(cacheKey);
    if (cachedOrder) return cachedOrder;

    const order = await this.dataSource.getRepository(OrderEntity).findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    await this.redisService.set(cacheKey, order, 300);
    return order;
  }

  async remove(id: number) {
    await this.dataSource.getRepository(OrderEntity).delete(id);

    await this.redisService.del(`order_${id}`);
    await this.redisService.del('all_orders');

    return { deleted: true };
  }
}
