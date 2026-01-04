import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // عشان يكون متاح لكل الموديولات بدون ما تعيد استيراده
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
