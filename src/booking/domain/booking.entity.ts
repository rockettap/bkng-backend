import { DomainError } from 'src/common/errors/domain.error';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { BookingStatus } from './booking-status.enum';

export class Booking {
  constructor(
    public readonly sellerId: number,
    private timeRange: TimeRange,
    public readonly pricePerHour: number,
    private _status: BookingStatus = BookingStatus.PENDING,
    public stripeSessionId?: string,
    public readonly id: number = 0,
  ) {
    const MINIMUM_ADVANCE_TIME_MS = 5 * 60 * 1000; // 5 minutes

    if (this.from.getTime() < Date.now() + MINIMUM_ADVANCE_TIME_MS) {
      throw new DomainError('Bookings must be at least 5 minutes in advance.');
    }
  }

  get from(): Date {
    return this.timeRange.from;
  }

  get to(): Date {
    return this.timeRange.to;
  }

  get price(): number {
    const MILLISECONDS_PER_15_MIN = 1000 * 60 * 15;

    const durationMs = this.timeRange.durationMs;
    const blocks = Math.ceil(durationMs / MILLISECONDS_PER_15_MIN);
    const hours = blocks * 0.25;

    return hours * this.pricePerHour;
  }

  get status(): BookingStatus {
    return this._status;
  }

  msUntilStart(): number {
    return Math.max(this.from.getTime() - Date.now(), 0);
  }

  confirm(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new DomainError('Only pending bookings can be confirmed.');
    }
    this._status = BookingStatus.CONFIRMED;
  }

  cancel(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new DomainError('Only pending bookings can be cancelled.');
    }
    this._status = BookingStatus.CANCELLED;
  }

  refund(): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new DomainError('Only confirmed bookings can be refunded.');
    }
    this._status = BookingStatus.REFUNDED;
  }

  toJSON(): object {
    return {
      ...this.timeRange,
      pricePerHour: this.pricePerHour,
    };
  }
}
