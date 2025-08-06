import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-google-oauth20';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtTokens } from './types/jwt-tokens.type';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleLogin(profile: Profile): Promise<JwtTokens> {
    const user = await this.usersService.findBySub(profile.id);
    if (!user) {
      const newUser = await this.usersService.create(
        User.createWithGoogle(0, profile.id),
      );

      return this.generateTokens(newUser);
    }

    return this.generateTokens(user);
  }

  async signUp(email: string, password: string): Promise<JwtTokens> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(
      User.createWithEmail(0, email, passwordHash),
    );

    return this.generateTokens(user);
  }

  async signIn(email: string, password: string): Promise<JwtTokens> {
    const user = await this.usersService.findByEmail(email);
    const isValid =
      user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(user);
  }

  async refreshToken(refresh_token: string): Promise<JwtTokens> {
    const decoded = this.jwtService.verify<JwtPayload>(refresh_token);

    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new ForbiddenException();
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User): JwtTokens {
    const payload = { sub: user.id, username: `test-username-${user.id}` };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
