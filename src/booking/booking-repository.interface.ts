import { Booking } from './booking.entity';

export interface BookingRepository {
  findById(id: number): Promise<Booking | null>;
  findManyInRange(userId: number, from: Date, to: Date): Promise<Booking[]>;
  create(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
}
