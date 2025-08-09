export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!Email.isValid(value)) {
      throw new Error('Invalid email format.');
    }
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }

  private static isValid(value: string): boolean {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
  }
}
