import { Availability } from './availability.entity';

export interface AvailabilityRepository {
  findById(userId: number, from: Date, to: Date): Promise<Availability | null>;
  findManyInRange(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<Availability[]>;
  create(availability: Availability): Promise<Availability>;
  delete(availability: Availability): Promise<boolean>;
}
