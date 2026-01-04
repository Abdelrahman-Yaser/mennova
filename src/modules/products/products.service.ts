import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductImage } from '.././product-images/entities/product-image.entity';
import { Size } from '../sizes/entities/size.entity';
import { UpdateProductDto } from './dto/update_product.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,

    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    private readonly redisService: RedisService,
  ) {}

  // مفاتيح الكاش كـ constants لتجنب الأخطاء الإملائية
  private readonly ALL_PRODUCTS_CACHE = 'all_products';
  private readonly PRODUCT_CACHE_PREFIX = 'product_';

  // جلب كل المنتجات
  async findAll(): Promise<Product[]> {
    const cachedProducts = await this.redisService.get<Product[]>(
      this.ALL_PRODUCTS_CACHE,
    );
    if (cachedProducts) return cachedProducts;

    const products = await this.productRepository.find({
      relations: ['images', 'sizes'],
      order: { images: { is_main: 'DESC' } },
    });

    await this.redisService.set(this.ALL_PRODUCTS_CACHE, products, 3600);
    return products;
  }

  // جلب منتج واحد (أضفنا الكاش هنا أيضاً)
  async findOne(id: string): Promise<Product> {
    const cacheKey = `${this.PRODUCT_CACHE_PREFIX}${id}`;
    const cachedProduct = await this.redisService.get<Product>(cacheKey);
    if (cachedProduct) return cachedProduct;

    const product = await this.productRepository.findOne({
      where: { id: +id },
      relations: ['images', 'sizes'],
      order: { images: { is_main: 'DESC' } },
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    await this.redisService.set(cacheKey, product, 3600);
    return product;
  }

  // إنشاء منتج جديد
  async create(dto: CreateProductDto): Promise<Product> {
    const { images, sizes, ...baseData } = dto;
    const product = this.productRepository.create(baseData);

    if (images?.length) {
      product.images = images.map((img) => this.imageRepository.create(img));
    }

    if (sizes?.length) {
      product.sizes = sizes.map((s) =>
        this.sizeRepository.create({
          ...s,
          value: Array.isArray(s.value) ? s.value : [s.value],
        }),
      );
    }

    const savedProduct = await this.productRepository.save(product);

    // مسح كاش القائمة الشاملة لأن هناك منتج جديد أضيف
    await this.redisService.del(this.ALL_PRODUCTS_CACHE);

    return this.findOne(savedProduct.id.toString());
  }

  // تحديث المنتج
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const { images, sizes, ...baseData } = dto;

    const product = await this.productRepository.preload({
      id: +id,
      ...baseData,
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    if (Array.isArray(images)) {
      await this.imageRepository.delete({ product: { id: +id } });
      product.images = images.map((img) => this.imageRepository.create(img));
    }

    if (Array.isArray(sizes)) {
      await this.sizeRepository.delete({ product: { id: +id } });
      product.sizes = sizes.map((s) =>
        this.sizeRepository.create({
          ...s,
          value: Array.isArray(s.value) ? s.value : [s.value],
        }),
      );
    }

    await this.productRepository.save(product);

    // --- تحديث الكاش ---
    await this.redisService.del(this.ALL_PRODUCTS_CACHE); // امسح كاش الكل
    await this.redisService.del(`${this.PRODUCT_CACHE_PREFIX}${id}`); // امسح كاش هذا المنتج تحديداً

    return this.findOne(id);
  }

  // حذف منتج
  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // --- مسح الكاش ---
    await this.redisService.del(this.ALL_PRODUCTS_CACHE);
    await this.redisService.del(`${this.PRODUCT_CACHE_PREFIX}${id}`);
  }
}
