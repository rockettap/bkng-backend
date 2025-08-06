export class User {
  private constructor(
    public readonly id: number,
    private _email?: string,
    private _passwordHash?: string,
    private _sub?: string,
    public stripeId?: string,
    public googleAccessToken?: string,
    public googleRefreshToken?: string,
  ) {}

  get email(): string | undefined {
    return this._email;
  }

  get passwordHash(): string | undefined {
    return this._passwordHash;
  }

  get sub(): string | undefined {
    return this._sub;
  }

  static createWithEmail(
    id: number,
    email: string,
    passwordHash: string,
    stripeId?: string,
  ): User {
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw new Error();
    }
    return new User(id, email, passwordHash, undefined, stripeId);
  }

  static createWithGoogle(
    id: number,
    sub: string,
    stripeId?: string,
    googleAccessToken?: string,
    googleRefreshToken?: string,
  ): User {
    return new User(
      id,
      undefined,
      undefined,
      sub,
      stripeId,
      googleAccessToken,
      googleRefreshToken,
    );
  }

  toJSON(): object {
    return {
      id: this.id,
    };
  }
}
