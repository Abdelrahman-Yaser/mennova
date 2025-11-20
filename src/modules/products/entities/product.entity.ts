import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToMany,
} from 'typeorm';
import { ProductImage } from '../../product-images/entities/product-image.entity';
import { Size } from '../../sizes/entities/size.entity';

@Entity('products')
@Check(`"stock_quantity" >= 0`)
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_percent!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    asExpression: `"price" - ("price" * COALESCE("discount_percent",0) / 100)`,
    generatedType: 'STORED',
  })
  final_price!: number;

  @Column({ type: 'int' })
  stock_quantity!: number;

  @Column({ type: 'int', default: 0 })
  final_quantity!: number;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: false,
  })
  images!: ProductImage[];

  @OneToMany(() => Size, (size) => size.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sizes!: Size[];
}
