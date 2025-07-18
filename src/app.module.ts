import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AvailabilityModule,
    BookingModule,
    PaymentModule,
  ],
})
export class AppModule {}
