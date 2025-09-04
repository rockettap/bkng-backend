export class BookingPaymentFailedError extends Error {
  constructor() {
    super('Payment could not be processed for this booking.');
  }
}
