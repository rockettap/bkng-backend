import { Repository } from 'src/common/repository.interface';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { Availability } from './availability.entity';

export interface AvailabilityRepository
  extends Repository<Availability, { userId: number; timeRange: TimeRange }> {
  findManyInTimeRange(
    userId: number,
    timeRange: TimeRange,
  ): Promise<Availability[]>;
}
