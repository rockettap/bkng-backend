import { Inject, Injectable } from '@nestjs/common';
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

  async create(userId: number, from: Date, to: Date): Promise<Availability> {
    const overlapping = await this.availabilityRepository.findManyInRange(
      userId,
      from,
      to,
    );

    if (overlapping.length > 0) {
      throw new Error('Availability overlaps with existing availabilities.');
    }

    if (this.policy.isSatisfiedBy(from, to)) {
      throw new Error('Availability duration violates policy limits.');
    }

    return await this.availabilityRepository.create(
      new Availability(userId, from, to),
    );
  }

  async findManyInRange(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<Availability[]> {
    return await this.availabilityRepository.findManyInRange(userId, from, to);
  }
}
