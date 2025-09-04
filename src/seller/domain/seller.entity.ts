import { Email } from './value-objects/email.vo';
import { Profile } from './value-objects/profile.vo';

interface AuthMethod {
  get id(): any;
}

export class EmailAuth implements AuthMethod {
  constructor(
    private readonly _email: Email,
    private readonly _passwordHash: string,
  ) {}

  get id(): string {
    return this.email.value;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get email(): Email {
    return this._email;
  }
}

export class GoogleAuth implements AuthMethod {
  constructor(private readonly googleId: string) {}

  get id(): string {
    return this.googleId;
  }
}

export class Seller {
  constructor(
    public readonly id: number,
    private readonly _profile: Profile,
    private readonly _auth: AuthMethod,
    public stripeId?: string,
  ) {}

  get profile(): Profile {
    return this._profile;
  }

  get auth(): AuthMethod {
    return this._auth;
  }

  toJSON(): object {
    return {
      id: this.id,
      ...this.profile,
    };
  }
}
