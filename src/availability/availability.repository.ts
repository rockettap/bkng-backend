import { Injectable } from '@nestjs/common';
import { Availability as PrismaAvailability } from 'generated/prisma';
import { TimeRange as DomainTimeRange } from 'src/common/value-objects/time-range.vo';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailabilityRepository } from './availability-repository.interface';
import { Availability as DomainAvailability } from './availability.entity';

@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: {
    userId: number;
    timeRange: DomainTimeRange;
  }): Promise<DomainAvailability | null> {
    const availability = await this.prisma.availability.findUnique({
      where: {
        userId_from_to: {
          userId: id.userId,
          from: id.timeRange.from,
          to: id.timeRange.to,
        },
      },
    });
    return availability ? this.toDomain(availability) : null;
  }

  async findManyInTimeRange(
    userId: number,
    timeRange: DomainTimeRange,
  ): Promise<DomainAvailability[]> {
    const records = await this.prisma.availability.findMany({
      where: {
        userId,
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
        userId: availability.userId,
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
        userId_from_to: {
          userId: availability.userId,
          from: availability.from,
          to: availability.to,
        },
      },
    });
    return deletedPrismaAvailability ? true : false;
  }

  private toDomain(availability: PrismaAvailability): DomainAvailability {
    return new DomainAvailability(
      availability.userId,
      this.mapTimeRange(availability.from, availability.to),
      availability.pricePerHour,
    );
  }

  private mapTimeRange(from: Date, to: Date): DomainTimeRange {
    return new DomainTimeRange(from, to);
  }
}
