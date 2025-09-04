export class BookingOverlapError extends Error {
  constructor() {
    super('Booking overlaps with existing bookings.');
  }
}
