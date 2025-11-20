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

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        customername: createOrderDto.customerName,
        customeremail: createOrderDto.customerEmail,
        customerphone: createOrderDto.customerPhone,
      });

      await manager.save(order);

      // 2) حفظ كل عنصر من عناصر الطلب
      for (const item of createOrderDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${product.id}`,
          );
        }

        // تقليل المخزون
        product.stock_quantity -= item.quantity;
        await manager.save(product);

        // إنشاء order item
        const orderItem = manager.create(OrderItem, {
          order,
          productId: product.id,
          productName: product.name, // أو item.productName
          quantity: item.quantity,
          price: item.price, // ← مهم جدًا
        });

        await manager.save(orderItem);
        return orderItem;
      }
    });
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
