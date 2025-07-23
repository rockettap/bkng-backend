import { BookingStatus } from './booking-status.enum';

export class Booking {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly from: Date,
    public readonly to: Date,
    private _status: BookingStatus = BookingStatus.PENDING,
    public stripeSessionId?: string,
  ) {
    if (from >= to) {
      throw new Error("The 'from' date must be earlier than the 'to' date.");
    }

    if (!Booking.isSameDay(from, to)) {
      throw new Error("The 'from' and 'to' dates must be on the same day.");
    }
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  get status(): BookingStatus {
    return this._status;
  }

  get price(): number {
    const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

    const durationMs = this.to.getTime() - this.from.getTime();
    const hours = Math.ceil(durationMs / MILLISECONDS_PER_HOUR);
    const hourlyRate = 100; // TODO: change to the option associated with the user

    return hours * hourlyRate;
  }

  confirm(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new Error('Only pending bookings can be confirmed.');
    }
    this._status = BookingStatus.CONFIRMED;
  }

  cancel(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new Error('Only pending bookings can be cancelled.');
    }
    this._status = BookingStatus.CANCELLED;
  }

  refund(): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new Error('Only confirmed bookings can be refunded.');
    }
    this._status = BookingStatus.REFUNDED;
  }
}
