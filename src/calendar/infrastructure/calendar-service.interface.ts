import { Booking } from 'src/booking/booking.entity';
import { Email } from 'src/users/value-objects/email.vo';

export interface CalendarService {
  createEvent(booking: Booking, email?: Email): Promise<void>;
}
