import { Email } from './value-objects/email.vo';
import { Profile } from './value-objects/profile.vo';

export class User {
  private constructor(
    public readonly id: number,
    private _profile: Profile,
    private _email?: Email,
    private _passwordHash?: string,
    private _googleId?: string,
    public stripeId?: string,
    // private _googleAccessToken?: string,
    // private _googleRefreshToken?: string,
  ) {}

  get profile(): Profile {
    return this._profile;
  }

  get email(): string | undefined {
    return this._email?.value;
  }

  get passwordHash(): string | undefined {
    return this._passwordHash;
  }

  get googleId(): string | undefined {
    return this._googleId;
  }

  // get googleAccessToken(): string | undefined {
  //   return this._googleAccessToken;
  // }

  // get googleRefreshToken(): string | undefined {
  //   return this._googleRefreshToken;
  // }

  // updateTokens(accessToken: string, refreshToken: string) {
  //   this._googleAccessToken = accessToken;
  //   this._googleRefreshToken = refreshToken;
  // }

  static createWithEmail(
    id: number,
    email: string,
    passwordHash: string,
    firstName?: string,
    familyName?: string,
    stripeId?: string,
  ): User {
    return new User(
      id,
      new Profile(firstName, familyName),
      new Email(email),
      passwordHash,
      undefined,
      stripeId,
    );
  }

  static createWithGoogle(
    id: number,
    googleId: string,
    firstName?: string,
    familyName?: string,
    avatarUrl?: string,
    stripeId?: string,
    // googleAccessToken?: string,
    // googleRefreshToken?: string,
  ): User {
    return new User(
      id,
      new Profile(
        firstName,
        familyName,
        avatarUrl ? new URL(avatarUrl) : undefined,
      ),
      undefined,
      undefined,
      googleId,
      stripeId,
      // googleAccessToken,
      // googleRefreshToken,
    );
  }

  toJSON(): object {
    return {
      id: this.id,
      ...this.profile,
    };
  }
}
