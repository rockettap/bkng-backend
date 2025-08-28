export class BookingNotFoundException extends Error {
  constructor(bookingId: number) {
    super(`Booking with ID ${bookingId} not found.`);
  }
}
