import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET',
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: { username: string; sub: number }): Promise<{
    userId: number;
    username: string;
  }> {
    return { userId: payload.sub, username: payload.username };
  }
}
