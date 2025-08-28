export class TimeRange {
  constructor(
    public readonly from: Date,
    public readonly to: Date,
  ) {
    this.from = TimeRange.stripToMinutes(from);
    this.to = TimeRange.stripToMinutes(to);

    if (this.from >= this.to) {
      throw new Error("The 'from' date must be earlier than the 'to' date.");
    }

    if (!TimeRange.isSameDay(this.from, this.to)) {
      throw new Error("The 'from' and 'to' dates must be on the same day.");
    }
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  private static stripToMinutes(date: Date): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }

  get durationMs(): number {
    return this.to.getTime() - this.from.getTime();
  }

  toJSON(): object {
    return { from: this.from, to: this.to };
  }
}
