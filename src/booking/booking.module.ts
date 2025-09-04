import { forwardRef, Module } from '@nestjs/common';
import { AvailabilityModule } from 'src/availability/availability.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { PaymentModule } from 'src/payment/payment.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SellerModule } from 'src/seller/seller.module';
import { BookingService } from './application/booking.service';
import { BOOKING_REPOSITORY } from './application/tokens';
import { BookingController } from './infrastructure/booking.controller';
import { PrismaBookingRepository } from './infrastructure/booking.repository';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    PrismaModule,
    AvailabilityModule,
    SellerModule,
    forwardRef(() => PaymentModule),
    CalendarModule,
    ReminderModule,
  ],
  providers: [
    BookingService,
    {
      provide: BOOKING_REPOSITORY,
      useClass: PrismaBookingRepository,
    },
  ],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
