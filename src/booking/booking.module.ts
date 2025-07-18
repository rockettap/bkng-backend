import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityModule } from 'src/availability/availability.module';
import { PrismaBookingRepository } from './booking.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, AvailabilityModule, UsersModule],
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
