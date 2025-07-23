import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityModule } from 'src/availability/availability.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentModule } from 'src/payment/payment.module';
import { BookingService } from './booking.service';
import { PrismaBookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    PrismaModule,
    AvailabilityModule,
    UsersModule,
    forwardRef(() => PaymentModule),
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
