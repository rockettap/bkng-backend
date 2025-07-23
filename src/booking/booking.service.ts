import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AvailabilityRepository } from 'src/availability/availability-repository.interface';
import { UsersService } from 'src/users/users.service';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { BookingRepository } from './booking-repository.interface';
import { Booking } from './booking.entity';
import { BookingStatus } from './booking-status.enum';

@Injectable()
export class BookingService {
  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    @Inject('BookingRepository')
    private readonly bookingRepository: BookingRepository,
  ) {}

  async create(userId: number, from: Date, to: Date): Promise<string> {
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

    // We should also implement specific user rules, such as a time window before booking.
    // For example, if the user books a time at 12:15 for a slot at 12:20,
    // it should be allowed if the difference option is >= 5 minutes

    const booking = await this.bookingRepository.create(
      new Booking(0, userId, from, to),
    );

    const session = await this.stripeService.createCheckoutSession(
      booking,
      user,
    );

    booking.stripeSessionId = session.id;
    await this.bookingRepository.update(booking);

    return session.url!;
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
