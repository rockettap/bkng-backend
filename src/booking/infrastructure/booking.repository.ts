import { Injectable } from '@nestjs/common';
import {
  Booking as PrismaBooking,
  BookingStatus as PrismaBookingStatus,
} from 'generated/prisma';
import { TimeRange as DomainTimeRange } from 'src/common/value-objects/time-range.vo';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingRepository } from '../domain/booking-repository.interface';
import { BookingStatus as DomainBookingStatus } from '../domain/booking-status.enum';
import { Booking as DomainBooking } from '../domain/booking.entity';

@Injectable()
export class PrismaBookingRepository implements BookingRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainBooking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    return booking ? this.toDomain(booking) : null;
  }

  async findManyInTimeRange(
    sellerId: number,
    timeRange: DomainTimeRange,
  ): Promise<DomainBooking[]> {
    const records = await this.prisma.booking.findMany({
      where: {
        sellerId,
        AND: [
          {
            from: {
              lte: timeRange.to,
            },
          },
          {
            to: {
              gte: timeRange.from,
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
        sellerId: booking.sellerId,
        from: booking.from,
        to: booking.to,
        pricePerHour: booking.pricePerHour,
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
      booking.sellerId,
      this.mapTimeRange(booking.from, booking.to),
      booking.pricePerHour,
      this.mapStatus(booking.status),
      booking.stripeSessionId ?? undefined,
      booking.id,
    );
  }

  private mapTimeRange(from: Date, to: Date): DomainTimeRange {
    return new DomainTimeRange(from, to);
  }

  private mapStatus(status: PrismaBookingStatus): DomainBookingStatus {
    return status as DomainBookingStatus;
  }
}
