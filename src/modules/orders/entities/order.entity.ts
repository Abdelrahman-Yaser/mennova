import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250 })
  customername!: string;

  @Column({ type: 'varchar', length: 250 })
  customeremail!: string;

  @Column({ type: 'varchar', length: 15 })
  customerphone!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items!: OrderItem[];

}
