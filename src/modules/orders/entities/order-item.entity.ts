import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { Product } from '../../products/entities/product.entity';
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;
  @Column()
  productName!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal')
  price!: number;
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;
  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  order!: OrderEntity;
}
