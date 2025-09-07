import { Booking } from 'src/booking/domain/booking.entity';
import { Email } from 'src/seller/domain/value-objects/email.vo';

export interface CalendarService {
  createEvent(booking: Booking, email?: Email): Promise<string | void>;
}
