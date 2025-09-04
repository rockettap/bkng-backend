import { Injectable } from '@nestjs/common';
import { Availability as PrismaAvailability } from 'generated/prisma';
import { TimeRange as DomainTimeRange } from 'src/common/value-objects/time-range.vo';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailabilityRepository } from '../domain/availability-repository.interface';
import { Availability as DomainAvailability } from '../domain/availability.entity';

@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: {
    sellerId: number;
    timeRange: DomainTimeRange;
  }): Promise<DomainAvailability | null> {
    const availability = await this.prisma.availability.findUnique({
      where: {
        sellerId_from_to: {
          sellerId: id.sellerId,
          from: id.timeRange.from,
          to: id.timeRange.to,
        },
      },
    });
    return availability ? this.toDomain(availability) : null;
  }

  async findManyInTimeRange(
    sellerId: number,
    timeRange: DomainTimeRange,
  ): Promise<DomainAvailability[]> {
    const records = await this.prisma.availability.findMany({
      where: {
        sellerId: sellerId,
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
    return records.map((availability) => this.toDomain(availability));
  }

  async create(availability: DomainAvailability): Promise<DomainAvailability> {
    const createdAvailability = await this.prisma.availability.create({
      data: {
        sellerId: availability.sellerId,
        from: availability.from,
        to: availability.to,
        pricePerHour: availability.pricePerHour,
      },
    });
    return this.toDomain(createdAvailability);
  }

  async delete(availability: DomainAvailability): Promise<boolean> {
    const deletedPrismaAvailability = await this.prisma.availability.delete({
      where: {
        sellerId_from_to: {
          sellerId: availability.sellerId,
          from: availability.from,
          to: availability.to,
        },
      },
    });
    return deletedPrismaAvailability ? true : false;
  }

  private toDomain(availability: PrismaAvailability): DomainAvailability {
    return new DomainAvailability(
      availability.sellerId,
      this.mapTimeRange(availability.from, availability.to),
      availability.pricePerHour,
    );
  }

  private mapTimeRange(from: Date, to: Date): DomainTimeRange {
    return new DomainTimeRange(from, to);
  }
}
