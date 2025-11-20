import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  @IsPositive()
  productId!: number;

  @ApiProperty({ description: 'Product name', example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ description: 'Price per unit', example: 999.99 })
  @IsNumber()
  @IsPositive()
  price!: number;
}
