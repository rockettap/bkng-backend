import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '52484676792-9k82hboi7a3ijhjpqh4tvta2m5i5tnmr.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User | null> {
    this.logger.debug(
      `access token: ${accessToken}; refresh token: ${refreshToken}`,
    );
    this.logger.log(profile._json);

    return await this.authService.validateGoogleLogin(profile);
  }
}
