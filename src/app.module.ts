import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [AuthModule, UsersModule, AvailabilityModule, BookingModule],
})
export class AppModule {}
