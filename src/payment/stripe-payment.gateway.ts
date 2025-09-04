import { Booking } from 'src/booking/domain/booking.entity';
import Stripe from 'stripe';
import { PaymentGateway } from './payment-gateway.interface';

export class StripeBookingPaymentGateway
  implements PaymentGateway<Booking, { stripeId: string }>
{
  constructor(private readonly stripe: Stripe) {}

  async create(booking: Booking, user: { stripeId: string }): Promise<void> {
    if (!user.stripeId) throw new Error();

    await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'UAH',
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
      cancel_url:
        'http://localhost:3000/booking/cancel?session_id={CHECKOUT_SESSION_ID}',
    });
  }
}
