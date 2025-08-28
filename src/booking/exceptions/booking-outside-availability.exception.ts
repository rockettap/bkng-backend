export class BookingOutsideAvailabilityException extends Error {
  constructor() {
    super('Booking must be within availability.');
  }
}
