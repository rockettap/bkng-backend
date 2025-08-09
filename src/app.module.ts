import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingModule } from './booking/booking.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    UsersModule,
    AvailabilityModule,
    BookingModule,
    PaymentModule,
    GoogleCalendarModule,
    MailModule,
  ],
})
export class AppModule {}
