import { forwardRef, Module } from '@nestjs/common';
import { AvailabilityModule } from 'src/availability/availability.module';
import { CalendarModule } from 'src/calendar/calendar.module';
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
    CalendarModule,
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
