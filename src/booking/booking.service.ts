import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { BookingRepository } from './booking-repository.interface';
import { Booking } from './booking.entity';
import { BookingStatus } from './booking-status.enum';
import { AvailabilityRepository } from 'src/availability/availability-repository.interface';
import { UsersService } from 'src/users/users.service';

export const stripe = new Stripe(
  'sk_test_51RjhHkQ4XyEBZ60C61IgBjBkjuFKBFvxW9CzEyMhDlzfguKNGodfcH9gLsk77Pa4KZPdZZpn6T4oWByVHmj3ZRce00arhhENKO',
);

@Injectable()
export class BookingService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    @Inject('BookingRepository')
    private readonly bookingRepository: BookingRepository,
  ) {}

  async create(
    userId: number, // 'acct_1RjhZKPssrEAyCcm'
    from: Date,
    to: Date,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error(`User with ID '${userId}' not found.`);
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
    // it should be allowed if the difference is >= 5 minutes

    const booking = await this.bookingRepository.create(
      new Booking(0, userId, from, to),
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'uah',
            product_data: {
              name: 'Бронювання',
            },
            unit_amount: 20000,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: 100,
        transfer_data: {
          destination: user.stripeId!,
        },
      },
      metadata: {
        booking_id: booking.id,
      },
      success_url:
        'https://a5ec7aea8319.ngrok-free.app/booking/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://a5ec7aea8319.ngrok-free.app/booking/cancel',
    });

    booking.stripeSessionId = session.id;
    await this.bookingRepository.update(booking);

    return session.url!;
  }

  async temp(session: string) {
    await stripe.checkout.sessions.expire(session);
  }

  async confirm(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking with ID '${bookingId}' not found.`);
    }

    booking.confirm();

    await this.bookingRepository.update(booking);
  }

  async cancel(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking with ID '${bookingId}' not found.`);
    }

    booking.cancel();

    await this.bookingRepository.update(booking);
  }
}
