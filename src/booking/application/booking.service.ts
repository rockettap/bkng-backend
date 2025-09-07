import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AVAILABILITY_REPOSITORY } from 'src/availability/application/tokens';
import { AvailabilityRepository } from 'src/availability/domain/availability-repository.interface';
import { CalendarOrchestrator } from 'src/calendar/application/calendar.orchestrator';
import { TimeRange } from 'src/common/value-objects/time-range.vo';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { SellerService } from 'src/seller/application/seller.service';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { BookingRepository } from '../domain/booking-repository.interface';
import { BookingStatus } from '../domain/booking-status.enum';
import { Booking } from '../domain/booking.entity';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { BookingOutsideAvailabilityError } from '../domain/errors/booking-outside-availability.error';
import { BookingOverlapError } from '../domain/errors/booking-overlap.error';
import { BookingPaymentFailedError } from '../domain/errors/booking-payment-failed.error';
import { ReminderService } from '../reminder/reminder.service';
import { BOOKING_REPOSITORY } from './tokens';

@Injectable()
export class BookingService {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly calendarOrchestrator: CalendarOrchestrator,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly sellerService: SellerService,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
    private readonly reminderService: ReminderService,
  ) {}

  async create(
    sellerId: number,
    from: Date,
    to: Date,
  ): Promise<string | undefined> {
    const timeRange = new TimeRange(from, to);

    const seller = await this.sellerService.findByIdOrThrow(sellerId);
    if (!seller.stripeId) {
      throw new Error();
    }

    const availabilityOverlapping =
      await this.availabilityRepository.findManyInTimeRange(
        sellerId,
        timeRange,
      );
    if (availabilityOverlapping.length !== 1) {
      throw new BookingOutsideAvailabilityError();
    }

    const bookingOverlapping = (
      await this.bookingRepository.findManyInTimeRange(sellerId, timeRange)
    ).filter(
      (booking) =>
        booking.status !== BookingStatus.CANCELLED &&
        booking.status !== BookingStatus.REFUNDED,
    );
    if (bookingOverlapping.length > 0) {
      throw new BookingOverlapError();
    }

    const booking = await this.bookingRepository.create(
      new Booking(sellerId, timeRange, availabilityOverlapping[0].pricePerHour),
    );

    try {
      const session = await this.stripeService.createCheckoutSession(
        booking,
        seller,
      );

      booking.stripeSessionId = session.id;
      await this.bookingRepository.update(booking);

      return session.url!;
    } catch (error) {
      console.log(error);

      booking.cancel();
      await this.bookingRepository.update(booking);

      throw new BookingPaymentFailedError();
    }
  }

  async confirm(bookingId: number, email?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError(bookingId);
    }

    booking.confirm();

    await this.sellerService.findByIdOrThrow(booking.sellerId);

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
        email: email,
        from: booking.from,
        to: booking.to,
      },
      msUntilStart,
    );
  }

  async cancel(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError(bookingId);
    }

    booking.cancel();

    await this.bookingRepository.update(booking);

    await this.reminderService.cancelReminder(bookingId);
  }

  async refund(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError(bookingId);
    }

    booking.refund();

    await this.bookingRepository.update(booking);

    await this.reminderService.cancelReminder(bookingId);
  }
}
