import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-google-oauth20';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleLogin(
    profile: Profile,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findBySub(profile.id);
    if (!user) {
      const newUser = await this.usersService.create(
        User.createWithGoogle(0, profile.id),
      );

      const payload = { username: 'PLACEHOLDER', sub: newUser.id };
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      };
    }

    const payload = { username: 'PLACEHOLDER', sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(
      User.createWithEmail(0, email, passwordHash),
    );

    const payload = { username: 'PLACEHOLDER', sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByEmail(email);
    const isValid =
      user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));

    if (!isValid) throw new UnauthorizedException();

    const payload = { username: 'PLACEHOLDER', sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(
    refresh_token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const decoded = this.jwtService.verify<{ username: string; sub: number }>(
      refresh_token,
    );

    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new ForbiddenException();
    }

    const payload = { username: 'PLACEHOLDER', sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
