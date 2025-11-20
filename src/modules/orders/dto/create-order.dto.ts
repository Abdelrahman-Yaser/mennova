import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './createOrderItem.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+20123456789',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiProperty({
    description: 'List of order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
