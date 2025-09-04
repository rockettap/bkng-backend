export class BookingNotFoundError extends Error {
  constructor(bookingId: number) {
    super(`Booking with ID ${bookingId} not found.`);
  }
}
