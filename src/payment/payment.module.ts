import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { BookingModule } from 'src/booking/booking.module';
import { SellerModule } from 'src/seller/seller.module';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe/stripe.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        STRIPE_SECRET: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
      }),
    }),
    forwardRef(() => BookingModule),
    SellerModule,
  ],
  providers: [StripeService],
  controllers: [PaymentController],
  exports: [StripeService],
})
export class PaymentModule {}
