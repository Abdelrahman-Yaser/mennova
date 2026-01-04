import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
  ) {
    this.stripe = new Stripe(this.apiKey);
  }

  // Get Products
  async getProducts(): Promise<Stripe.Product[]> {
    try {
      // Type-safe definition
      const products: Stripe.ApiList<Stripe.Product> =
        await this.stripe.products.list();

      this.logger.log('Products fetched successfully');

      const productList: Stripe.Product[] = products.data;
      return productList; // ✅ typed, safe
    } catch (error: unknown) {
      // Type guard للتعامل مع unknown
      if (error instanceof Error) {
        this.logger.error('Failed to fetch products', error.stack);
        throw new InternalServerErrorException(error.message);
      }

      this.logger.error('Failed to fetch products (unknown error)');
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  // Get Customers
  async getCustomers(): Promise<Stripe.Customer[]> {
    try {
      const customers: Stripe.ApiList<Stripe.Customer> =
        await this.stripe.customers.list({});

      this.logger.log('Customers fetched successfully');

      // ✅ Type-safe return
      return customers.data as Stripe.Customer[];
    } catch (error: unknown) {
      // Type guard
      if (error instanceof Error) {
        this.logger.error('Failed to fetch customers', error.stack);
        throw new InternalServerErrorException(error.message);
      }

      // لأي error غير معروف
      this.logger.error('Failed to fetch customers (unknown error)');
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }
  // Accept Payments (Create Payment Intent)
  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = (await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      })) as Stripe.PaymentIntent; // ✅ Type-safe assertion

      this.logger.log(
        `PaymentIntent created successfully with amount: ${amount} ${currency}`,
      );

      return paymentIntent; // ✅ ESLint safe
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to create PaymentIntent', error.stack);
        throw new InternalServerErrorException(error.message);
      }
      this.logger.error('Failed to create PaymentIntent (unknown error)');
      throw new InternalServerErrorException('Failed to create PaymentIntent');
    }
  }

  // Subscriptions (Create Subscription)
  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      this.logger.log(
        `Subscription created successfully for customer ${customerId}`,
      );
      return subscription;
    } catch (error: unknown) {
      this.logger.error('Failed to create subscription', error);
      throw error;
    }
  }

  // Customer Management (Create Customer)
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({ email, name });
      this.logger.log(`Customer created successfully with email: ${email}`);
      return customer;
    } catch (error: unknown) {
      this.logger.error('Failed to create customer', error);
      throw error;
    }
  }

  // Product & Pricing Management (Create Product with Price)
  async createProduct(
    name: string,
    description: string,
    price: number,
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({ name, description });
      await this.stripe.prices.create({
        product: product.id,
        unit_amount: price * 100, // amount in cents
        currency: 'usd',
      });
      this.logger.log(`Product created successfully: ${name}`);
      return product;
    } catch (error: unknown) {
      this.logger.error('Failed to create product', error);
      throw error;
    }
  }

  // Refunds (Process Refund)
  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      this.logger.log(
        `Refund processed successfully for PaymentIntent: ${paymentIntentId}`,
      );
      return refund;
    } catch (error: unknown) {
      this.logger.error('Failed to process refund', error);
      throw error;
    }
  }

  // Payment Method Integration (Attach Payment Method)
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      this.logger.log(
        `Payment method ${paymentMethodId} attached to customer ${customerId}`,
      );
    } catch (error: unknown) {
      this.logger.error('Failed to attach payment method', error);
      throw error;
    }
  }

  // Reports and Analytics (Retrieve Balance)
  async getBalance(): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve();
      this.logger.log('Balance retrieved successfully');
      return balance;
    } catch (error: unknown) {
      this.logger.error('Failed to retrieve balance', error);
      throw error;
    }
  }

  // Payment Links
  async createPaymentLink(priceId: string): Promise<Stripe.PaymentLink> {
    try {
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
      });
      this.logger.log('Payment link created successfully');
      return paymentLink;
    } catch (error: unknown) {
      this.logger.error('Failed to create payment link', error);
      throw error;
    }
  }
}
