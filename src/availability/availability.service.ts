import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityRepository } from './availability-repository.interface';
import { Availability } from './availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async addAvailability(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<Availability> {
    const overlapping = await this.availabilityRepository.findManyInRange(
      userId,
      from,
      to,
    );

    if (overlapping.length > 0) {
      throw new Error('Availability overlaps with existing time slots.');
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
