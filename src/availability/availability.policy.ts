import { TimeRange } from 'src/common/value-objects/time-range.vo';
// import { UserSettings } from 'src/users/user-settings.class';

export class AvailabilityPolicy {
  constructor(
    private readonly minLengthInMinutes: number,
    private readonly maxLengthInMinutes: number,
  ) {}

  isSatisfiedBy(
    timeRange: TimeRange /* userSettings?: UserSettings */,
  ): boolean {
    // if (userSettings) {
    //   throw new Error('Method not implemented.');
    // }

    const durationInMinutes =
      (timeRange.to.getTime() - timeRange.from.getTime()) / 60_000;

    return (
      durationInMinutes >= this.minLengthInMinutes &&
      durationInMinutes <= this.maxLengthInMinutes
    );
  }
}
