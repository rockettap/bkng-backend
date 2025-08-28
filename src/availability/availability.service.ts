import { Inject, Injectable } from '@nestjs/common';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { AvailabilityRepository } from './availability-repository.interface';
import { Availability } from './availability.entity';
import { AvailabilityPolicy } from './availability.policy';

@Injectable()
export class AvailabilityService {
  private readonly policy = new AvailabilityPolicy(
    Number(process.env.MIN_LENGTH_IN_MINUTES ?? 30),
    Number(process.env.MAX_LENGTH_IN_MINUTES ?? 120),
  );

  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async create(
    userId: number,
    from: Date,
    to: Date,
    pricePerHour: number,
  ): Promise<Availability> {
    const timeRange = new TimeRange(from, to);

    const overlapping = await this.availabilityRepository.findManyInTimeRange(
      userId,
      timeRange,
    );

    if (overlapping.length > 0) {
      throw new Error('Availability overlaps with existing availabilities.');
    }

    if (!this.policy.isSatisfiedBy(timeRange)) {
      throw new Error('Availability duration violates policy.');
    }

    return await this.availabilityRepository.create(
      new Availability(userId, timeRange, pricePerHour),
    );
  }

  async findManyInTimeRange(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<Availability[]> {
    const timeRange = new TimeRange(from, to);

    return await this.availabilityRepository.findManyInTimeRange(
      userId,
      timeRange,
    );
  }
}
