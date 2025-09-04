import { Inject } from '@nestjs/common';
import { BOOKING_REPOSITORY } from 'src/booking/application/tokens';
import { BookingRepository } from 'src/booking/domain/booking-repository.interface';
import { Booking } from 'src/booking/domain/booking.entity';
import { ReminderService } from 'src/booking/reminder/reminder.service';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { PaymentHandler } from './payment-handler.interface';

export class BookingPaymentHandler implements PaymentHandler<Booking> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
    private readonly reminderService: ReminderService,
  ) {}

  async confirm(booking: Booking, email?: Email): Promise<void> {
    booking.confirm();
    await this.bookingRepository.update(booking);

    // Send a notification
    const REMINDER_OFFSET_MS = 30 * 60 * 1000; // 30 minutes
    const msUntilStart = booking.msUntilStart() - REMINDER_OFFSET_MS;

    if (msUntilStart <= 0 || !email) return;

    await this.reminderService.scheduleReminder(
      {
        bookingId: booking.id,
        sellerEmail: email.value,
        from: booking.from,
        to: booking.to,
      },
      msUntilStart,
    );
  }

  async cancel(booking: Booking): Promise<void> {
    booking.cancel();
    await this.bookingRepository.update(booking);

    await this.reminderService.cancelReminder(booking.id);
  }
}
