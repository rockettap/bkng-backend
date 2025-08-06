export class AvailabilityPolicy {
  constructor(
    private readonly minLengthInMinutes: number,
    private readonly maxLengthInMinutes: number,
  ) {}

  isSatisfiedBy(from: Date, to: Date): boolean {
    const durationInMinutes = (to.getTime() - from.getTime()) / 60000;
    return (
      durationInMinutes >= this.minLengthInMinutes &&
      durationInMinutes <= this.maxLengthInMinutes
    );
  }
}
