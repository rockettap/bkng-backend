import { forwardRef, Module } from '@nestjs/common';
import { AvailabilityModule } from 'src/availability/availability.module';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';
import { PaymentModule } from 'src/payment/payment.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { BookingController } from './booking.controller';
import { PrismaBookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    PrismaModule,
    AvailabilityModule,
    UsersModule,
    forwardRef(() => PaymentModule),
    GoogleCalendarModule,
    ReminderModule,
  ],
  providers: [
    BookingService,
    {
      provide: 'BookingRepository',
      useClass: PrismaBookingRepository,
    },
  ],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
