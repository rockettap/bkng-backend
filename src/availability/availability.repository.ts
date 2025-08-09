import { Injectable } from '@nestjs/common';
import { Availability as PrismaAvailability } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailabilityRepository } from './availability-repository.interface';
import { Availability as DomainAvailability } from './availability.entity';

@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private prisma: PrismaService) {}

  async findById(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<DomainAvailability | null> {
    const availability = await this.prisma.availability.findUnique({
      where: {
        userId_from_to: {
          userId,
          from,
          to,
        },
      },
    });
    return availability ? this.toDomain(availability) : null;
  }

  async findManyInRange(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<DomainAvailability[]> {
    const records = await this.prisma.availability.findMany({
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
      availability.from,
      availability.to,
      availability.pricePerHour,
    );
  }
}
