export class Profile {
  constructor(
    private _firstName?: string,
    private _familyName?: string,
    private _avatarUrl?: string,
  ) {}

  get firstName(): string | undefined {
    return this._firstName;
  }

  get familyName(): string | undefined {
    return this._familyName;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  isComplite(): boolean {
    if (!this._firstName || !this._familyName) {
      return false;
    }
    return true;
  }

  toJSON(): { firstName?: string; familyName?: string; avatarUrl?: string } {
    return {
      firstName: this._firstName,
      familyName: this._familyName,
      avatarUrl: this._avatarUrl,
    };
  }
}
