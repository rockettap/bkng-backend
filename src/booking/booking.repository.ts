import { PrismaService } from 'src/prisma/prisma.service';
import { Booking as DomainBooking } from './booking.entity';
import { Booking as PrismaBooking } from 'generated/prisma';
import { BookingStatus as DomainBookingStatus } from './booking-status.enum';
// import { BookingStatus as PrismaBookingStatus } from 'generated/prisma';
import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking-repository.interface';

@Injectable()
export class PrismaBookingRepository implements BookingRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainBooking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    return booking ? this.toDomain(booking) : null;
  }

  async findManyInRange(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<DomainBooking[]> {
    const records = await this.prisma.booking.findMany({
      where: {
        userId,
        AND: [
          {
            from: {
              lte: to,
            },
          },
          {
            to: {
              gte: from,
            },
          },
        ],
      },
    });
    return records.map((booking) => this.toDomain(booking));
  }

  async create(booking: DomainBooking): Promise<DomainBooking> {
    const createdBooking = await this.prisma.booking.create({
      data: {
        userId: booking.userId,
        from: booking.from,
        to: booking.to,
        status: booking.status,
        stripeSessionId: booking.stripeSessionId,
      },
    });
    return this.toDomain(createdBooking);
  }

  async update(booking: DomainBooking): Promise<DomainBooking> {
    const updatedPrismaBooking = await this.prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: booking.status,
        stripeSessionId: booking.stripeSessionId,
      },
    });
    return this.toDomain(updatedPrismaBooking);
  }

  private toDomain(booking: PrismaBooking): DomainBooking {
    return new DomainBooking(
      booking.id,
      booking.userId,
      booking.from,
      booking.to,
      // this.mapStatus(booking.status),
      booking.status as DomainBookingStatus,
      booking.stripeSessionId ?? undefined,
    );
  }

  // private mapStatus(status: PrismaBookingStatus): DomainBookingStatus {
  //   return status as DomainBookingStatus;
  // }
}
