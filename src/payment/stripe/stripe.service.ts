import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Booking } from 'src/booking/booking.entity';
import { BookingService } from 'src/booking/booking.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET!);

  constructor(
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    private readonly usersService: UsersService,
  ) {}

  async createAccountLink(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user.stripeId) {
      const account = await this.stripe.accounts.create({
        controller: {
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          stripe_dashboard: {
            type: 'express',
          },
        },
      });

      user.stripeId = account.id;
      await this.usersService.update(user);
    }

    const accountLink = await this.stripe.accountLinks.create({
      account: user.stripeId,
      refresh_url: 'http://localhost:3000/payment/stripe/connect',
      return_url: 'http://localhost:3000',
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  async createCheckoutSession(booking: Booking, user: User) {
    if (!user.stripeId) {
      throw new Error();
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'uah',
            product_data: {
              name: 'Booking',
            },
            unit_amount: booking.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: 100,
        transfer_data: {
          destination: user.stripeId,
        },
        metadata: {
          booking_id: booking.id,
        },
      },
      metadata: {
        booking_id: booking.id,
      },
      submit_type: 'book',
      success_url:
        'http://localhost:3000/booking/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/booking/cancel',
    });

    return session;
  }

  async handleEvent(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    const event = this.constructEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        this.logger.log({
          event: 'checkout.session.completed',
          object: event.data.object,
        });

        await this.bookingService.confirm(
          Number(event.data.object.metadata!.booking_id),
          event.data.object.customer_details?.email ?? undefined,
        );
        break;

      case 'checkout.session.expired':
        this.logger.log({
          event: 'checkout.session.expired',
          object: event.data.object,
        });

        await this.bookingService.cancel(
          Number(event.data.object.metadata!.booking_id),
        );
        break;

      case 'charge.refunded': {
        const chargeId = event.data.object.id;

        const charge = await this.stripe.charges.retrieve(chargeId, {
          expand: ['payment_intent'],
        });

        const paymentIntent = charge.payment_intent as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.booking_id;

        this.logger.log({
          event: 'charge.refunded',
          metadata: charge.metadata,
        });

        await this.bookingService.refund(Number(bookingId));
        break;
      }

      case 'charge.dispute.created':
        this.logger.warn({
          event: 'charge.dispute.created',
        });

        break;

      case 'charge.dispute.closed':
        this.logger.warn({
          event: 'charge.dispute.closed',
        });

        break;

      default:
        break;
    }
  }

  private constructEvent(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
