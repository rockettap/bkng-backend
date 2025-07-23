import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingService } from 'src/booking/booking.service';
import { UsersService } from 'src/users/users.service';
import { Booking } from 'src/booking/booking.entity';
import { User } from 'src/users/user.entity';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    private readonly usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET')!);
  }

  async createAccountLink(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error();
    }

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

      this.logger.verbose('user.stripeId is undefined');

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
      },
      metadata: {
        booking_id: booking.id,
      },
      success_url:
        'https://a5ec7aea8319.ngrok-free.app/booking/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://a5ec7aea8319.ngrok-free.app/booking/cancel',
    });

    return session;
  }

  async handleEvent(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    const event = this.constructEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        this.logger.log({
          'checkout.session.completed': event.data.object.metadata,
        });

        await this.bookingService.confirm(
          Number(event.data.object.metadata!.booking_id),
        );
        break;

      case 'checkout.session.expired':
        this.logger.log({
          'checkout.session.expired': event.data.object.metadata,
        });

        await this.bookingService.cancel(
          Number(event.data.object.metadata!.booking_id),
        );
        break;

      default:
        break;
    }
  }

  private constructEvent(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET')!,
    );
  }
}
