export class User {
  private constructor(
    public readonly id: number,
    private _email?: string,
    private _passwordHash?: string,
    private _sub?: string,
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
  ): User {
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw new Error();
    }
    return new User(id, email, passwordHash);
  }

  static createWithGoogle(id: number, sub: string): User {
    return new User(id, undefined, undefined, sub);
  }

  toJSON(): object {
    return {
      id: this.id,
      // email: this._email,
    };
  }
}
