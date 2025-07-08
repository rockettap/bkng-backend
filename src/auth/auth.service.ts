import { Injectable } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async validateOAuthLogin(user: Profile, provider: string): Promise<object> {
    return {
      ...user._json,
      provider,
    };
  }
}
