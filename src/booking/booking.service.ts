import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AvailabilityRepository } from 'src/availability/availability-repository.interface';
import { CalendarOrchestrator } from 'src/calendar/application/calendar.orchestrator';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';
import { Email } from 'src/users/value-objects/email.vo';
import { BookingRepository } from './booking-repository.interface';
import { BookingStatus } from './booking-status.enum';
import { Booking } from './booking.entity';
import { BookingNotFoundException } from './exceptions/booking-not-found.exception';
import { BookingOutsideAvailabilityException } from './exceptions/booking-outside-availability.exception';
import { BookingOverlapException } from './exceptions/booking-overlap.exception';
import { BookingPaymentFailedException } from './exceptions/booking-payment-failed.exception';
import { ReminderService } from './reminder/reminder.service';

@Injectable()
export class BookingService {
  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly calendarOrchestrator: CalendarOrchestrator,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly usersService: UsersService,
    @Inject('BookingRepository')
    private readonly bookingRepository: BookingRepository,
    private readonly reminderService: ReminderService,
  ) {}

  async create(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<string | undefined> {
    const timeRange = new TimeRange(from, to);

    const user = await this.usersService.findById(userId);
    if (!user.stripeId) {
      throw new Error();
    }

    const availabilityOverlapping =
      await this.availabilityRepository.findManyInTimeRange(userId, timeRange);
    if (availabilityOverlapping.length !== 1) {
      throw new BookingOutsideAvailabilityException();
    }

    const bookingOverlapping = (
      await this.bookingRepository.findManyInTimeRange(userId, timeRange)
    ).filter(
      (booking) =>
        booking.status !== BookingStatus.CANCELLED || BookingStatus.REFUNDED,
    );
    if (bookingOverlapping.length > 0) {
      throw new BookingOverlapException();
    }

    const booking = await this.bookingRepository.create(
      new Booking(
        0,
        userId,
        timeRange,
        availabilityOverlapping[0].pricePerHour,
      ),
    );

    try {
      const session = await this.stripeService.createCheckoutSession(
        booking,
        user,
      );

      booking.stripeSessionId = session.id;
      await this.bookingRepository.update(booking);

      return session.url!;
    } catch {
      booking.cancel();
      await this.bookingRepository.update(booking);

      throw new BookingPaymentFailedException();
    }
  }

  async confirm(bookingId: number, email?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    booking.confirm();

    // const user = await this.usersService.findById(booking.userId);
    // if (!user) {
    //   throw new UserNotFoundException(booking.userId);
    // }

    await this.bookingRepository.update(booking);

    // Create events in calendars
    await this.calendarOrchestrator.createEvents(
      booking,
      email ? new Email(email) : undefined,
    );

    // Send a notification
    const REMINDER_OFFSET_MS = 30 * 60 * 1000; // 30 minutes
    const msUntilStart = booking.msUntilStart() - REMINDER_OFFSET_MS;

    if (msUntilStart <= 0 || !email) return;

    await this.reminderService.scheduleReminder(
      {
        bookingId: booking.id,
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
      throw new BookingNotFoundException(bookingId);
    }

    booking.cancel();

    await this.bookingRepository.update(booking);

    await this.reminderService.cancelReminder(bookingId);
  }

  async refund(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    booking.refund();

    await this.bookingRepository.update(booking);

    await this.reminderService.cancelReminder(bookingId);
  }
}
