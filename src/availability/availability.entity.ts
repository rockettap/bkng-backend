export class Availability {
  constructor(
    public readonly userId: number,
    public readonly from: Date,
    public readonly to: Date,
  ) {
    if (from >= to) {
      throw new Error("The 'from' date must be earlier than the 'to' date.");
    }

    if (!Availability.isSameDay(from, to)) {
      throw new Error("The 'from' and 'to' dates must be on the same day.");
    }
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  toJSON(): object {
    return {
      from: this.from,
      to: this.to,
    };
  }
}
