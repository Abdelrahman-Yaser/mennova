// orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { RedisModule } from 'src/redis/redis.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItem]),
    RedisModule, // 🔹 مهم جدًا
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
