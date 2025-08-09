import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AvailabilityRepository } from 'src/availability/availability-repository.interface';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';
import { BookingRepository } from './booking-repository.interface';
import { BookingStatus } from './booking-status.enum';
import { Booking } from './booking.entity';
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

    const booking = await this.bookingRepository.create(
      new Booking(0, userId, from, to, availabilityOverlapping[0].pricePerHour),
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
    const REMINDER_OFFSET_MS = 5 * 60 * 1000; // 5 minutes
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
