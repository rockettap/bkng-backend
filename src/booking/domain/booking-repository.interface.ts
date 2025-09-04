import { Repository } from 'src/common/repository.interface';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { Booking } from './booking.entity';

export interface BookingRepository extends Repository<Booking> {
  findManyInTimeRange(
    sellerId: number,
    timeRange: TimeRange,
  ): Promise<Booking[]>;
  update(booking: Booking): Promise<Booking>;
}
