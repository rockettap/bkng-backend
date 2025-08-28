export class BookingOverlapException extends Error {
  constructor() {
    super('Booking overlaps with existing bookings.');
  }
}
