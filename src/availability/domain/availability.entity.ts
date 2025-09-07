import { DomainError } from 'src/common/errors/domain.error';
import { TimeRange } from 'src/common/value-objects/time-range.vo';

export class Availability {
  constructor(
    public readonly sellerId: number,
    private timeRange: TimeRange,
    public readonly pricePerHour: number,
  ) {
    const MINIMUM_ADVANCE_TIME_MS = 5 * 60 * 1000; // 5 minutes

    if (this.from.getTime() < Date.now() + MINIMUM_ADVANCE_TIME_MS) {
      throw new DomainError(
        'Availabilities must be at least 5 minutes in advance.',
      );
    }

    if (pricePerHour < 10000) {
      throw new DomainError('Price must be at least 100.00 UAH.');
    }
  }

  get from(): Date {
    return this.timeRange.from;
  }

  get to(): Date {
    return this.timeRange.to;
  }

  toJSON(): object {
    return {
      ...this.timeRange,
      pricePerHour: this.pricePerHour,
    };
  }
}
