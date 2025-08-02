import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AvailabilityRepository } from 'src/availability/availability-repository.interface';
import { UsersService } from 'src/users/users.service';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { BookingRepository } from './booking-repository.interface';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { Booking } from './booking.entity';
import { BookingStatus } from './booking-status.enum';
import { ReminderService } from './reminder/reminder.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    @Inject('BookingRepository')
    private readonly bookingRepository: BookingRepository,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly reminderService: ReminderService,
  ) {}

  async create(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<string | undefined> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.stripeId) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const MINIMUM_ADVANCE_TIME_MS = 5 * 60 * 1000;

    if (from.getTime() < Date.now() + MINIMUM_ADVANCE_TIME_MS) {
      throw new Error('Bookings must be at least 5 minutes in advance.');
    }

    const availabilityOverlapping =
      await this.availabilityRepository.findManyInRange(userId, from, to);
    if (availabilityOverlapping.length !== 1) {
      throw new Error('Booking must be within availability.');
    }

    const bookingOverlapping = (
      await this.bookingRepository.findManyInRange(userId, from, to)
    ).filter(
      (booking) =>
        booking.status !== BookingStatus.CANCELLED || BookingStatus.REFUNDED,
    );
    if (bookingOverlapping.length > 0) {
      throw new Error('Booking overlaps with existing bookings.');
    }

    // We should also implement specific user rules, such as a time window before booking.
    // For example, if the user books a time at 12:15 for a slot at 12:20,
    // it should be allowed if the difference option is >= 5 minutes

    const booking = await this.bookingRepository.create(
      new Booking(0, userId, from, to),
    );

    try {
      const session = await this.stripeService.createCheckoutSession(
        booking,
        user,
      );

      booking.stripeSessionId = session.id;
      await this.bookingRepository.update(booking);

      return session.url!;
    } catch (error) {
      booking.cancel();
      await this.bookingRepository.update(booking);

      if (error instanceof Error) {
        throw error;
      }
    }
  }

  async confirm(bookingId: number, email?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking with ID '${bookingId}' not found.`);
    }

    booking.confirm();

    const user = await this.usersService.findById(booking.userId);
    if (!user) {
      throw new Error(`User with ID ${booking.userId} not found.`);
    }

    // TEMP: we must extract from user
    user.googleAccessToken =
      'ya29.a0AS3H6NwX9xCEFOGNrUEDaX5dJRg9C-m16LCcDwqZhJ8rdIvZibGxtXT54hMzHV4MaBPu2Bd1JkV-M9oas_75kAqMiiD9hkDB5zBx4j42z-X9rSoBL0Y14NSgWri-dNXKbFcOwPIdIFvYkltsEukXH-MR9nShjqIQjcWz3NfgaCgYKAbUSARcSFQHGX2MiW3NsYBII97U-AUMrOi6hqw0175';
    user.googleRefreshToken =
      '1//09S4QItryNlgHCgYIARAAGAkSNwF-L9Ircu9uudLyIM6TUfXhZ6ZT2Q_AOmNDrCBHmgRJV96nIUDghEZ5o7eSyayQif_ks7n8Nw8';

    if (!user.googleAccessToken || !user.googleRefreshToken) {
      this.logger.warn({
        message:
          'User has probably not associated their account with Google Calendar.',
      });
    } else {
      await this.googleCalendarService.createGoogleCalendarEvent(
        {
          access_token: user.googleAccessToken,
          refresh_token: user.googleRefreshToken,
        },
        booking.id,
        booking.from,
        booking.to,
        email,
      );
    }

    await this.bookingRepository.update(booking);

    // Send a notification
    const REMINDER_OFFSET_MS = 5 * 60 * 1000;
    const msUntilStart = booking.msUntilStart() - REMINDER_OFFSET_MS;

    if (msUntilStart <= 0 || !email) return;

    await this.reminderService.scheduleReminder(
      {
        userEmail: email,
        from: booking.from,
        to: booking.to,
      },
      msUntilStart,
    );
  }

  async cancel(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking with ID '${bookingId}' not found.`);
    }

    booking.cancel();

    await this.bookingRepository.update(booking);
  }

  async refund(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking with ID '${bookingId}' not found.`);
    }

    booking.refund();

    await this.bookingRepository.update(booking);
  }
}
