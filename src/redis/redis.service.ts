// redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: RedisType;

  constructor() {
    // إعداد الاتصال بـ Redis
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // تسجيل أي خطأ
    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  // جلب البيانات من الكاش
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.error('Redis parse error for key', key, err);
      return null;
    }
  }

  // حفظ البيانات في الكاش مع TTL بالثواني
  async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await this.redis.set(key, stringValue, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  // مسح قيمة واحدة
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // مسح كل البيانات (اختياري، لا تستخدم في الإنتاج إلا عند الحاجة)
  async flushAll(): Promise<void> {
    await this.redis.flushall();
  }

  // فصل الاتصال عند انتهاء الموديول
  onModuleDestroy() {
    this.redis.disconnect();
  }
}
