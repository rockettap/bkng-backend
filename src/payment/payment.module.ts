import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from 'src/booking/booking.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe/stripe.service';

@Module({
  imports: [ConfigModule, forwardRef(() => BookingModule), UsersModule],
  providers: [StripeService],
  controllers: [PaymentController],
  exports: [StripeService],
})
export class PaymentModule {}
