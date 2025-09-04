export class BookingOutsideAvailabilityError extends Error {
  constructor() {
    super('Booking must be within availability.');
  }
}
