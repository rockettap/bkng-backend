export class Profile {
  constructor(
    private readonly _firstName?: string,
    private readonly _familyName?: string,
    private readonly _avatarUrl?: URL,
  ) {}

  get firstName(): string | undefined {
    return this._firstName;
  }

  get familyName(): string | undefined {
    return this._familyName;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl?.toString();
  }

  isComplete(): boolean {
    return !!(this._firstName && this._familyName);
  }

  toJSON(): { firstName?: string; familyName?: string; avatarUrl?: string } {
    return {
      firstName: this.firstName,
      familyName: this.familyName,
      avatarUrl: this.avatarUrl?.toString(),
    };
  }
}
