import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({})
export class StripeModule {
  // Factory method to create the module with dynamic configuration
  // nest used for injecting configuration values
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      imports: [ConfigModule.forRoot()],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService) =>
            configService.get<string>('STRIPE_API_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}