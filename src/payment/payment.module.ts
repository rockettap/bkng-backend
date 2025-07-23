import { ConfigModule } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { BookingModule } from 'src/booking/booking.module';
import { UsersModule } from 'src/users/users.module';
import { StripeService } from './stripe/stripe.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule, forwardRef(() => BookingModule), UsersModule],
  providers: [StripeService],
  controllers: [PaymentController],
  exports: [StripeService],
})
export class PaymentModule {}
