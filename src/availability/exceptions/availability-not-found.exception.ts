export class AvailabilitygNotFoundException extends Error {
  constructor(availabilityId: number) {
    super(`Availability with ID ${availabilityId} not found.`);
  }
}
