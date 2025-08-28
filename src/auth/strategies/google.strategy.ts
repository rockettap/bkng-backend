import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { JwtTokens } from '../types/jwt-tokens.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_PROFILE_REDIRECT_URI!,
      scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<JwtTokens> {
    // this.logger.log({ message: 'profile', profile: profile._json });
    // this.logger.debug({ message: 'tokens', accessToken, refreshToken });

    return await this.authService.validateGoogleLogin(profile);
  }
}
