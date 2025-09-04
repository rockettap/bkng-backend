export class AvailabilitygNotFoundError extends Error {
  constructor(availabilityId: number) {
    super(`Availability with ID ${availabilityId} not found.`);
  }
}
