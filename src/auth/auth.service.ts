import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from 'passport-google-oauth20';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtEmailPayload } from './types/jwt-email-payload.type';
import { JwtEmailToken } from './types/jwt-email-token.type';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtTokens } from './types/jwt-tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleLogin(profile: Profile): Promise<JwtTokens> {
    const user = await this.usersService.findBySub(profile.id);
    if (!user) {
      const newUser = await this.usersService.create(
        User.createWithGoogle(
          0,
          profile.id,
          profile._json.given_name,
          profile._json.family_name,
          profile._json.picture,
        ),
      );

      return this.generateTokens(newUser);
    }

    return this.generateTokens(user);
  }

  async sendEmailConfirmation(
    email: string,
    password: string,
    firstName: string,
    familyName: string,
  ) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      throw new ConflictException();
    }

    const emailToken = this.generateEmailToken(
      email,
      password,
      firstName,
      familyName,
    );

    await this.mailService.sendMail(
      email,
      'Account confirmation',
      this.mailService.renderTemplate('confirmation-mail', {
        token: emailToken.access_token,
      }),
    );
  }

  async verify(access_token: string): Promise<JwtTokens> {
    const decoded = this.jwtService.verify<JwtEmailPayload>(access_token);

    return await this.signUp(
      decoded.email,
      decoded.password,
      decoded.firstName,
      decoded.familyName,
    );
  }

  private async signUp(
    email: string,
    password: string,
    firstName: string,
    familyName: string,
  ): Promise<JwtTokens> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(
      User.createWithEmail(0, email, passwordHash, firstName, familyName),
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
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refresh_token);

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new NotFoundException(`User with ID ${decoded.sub} not found.`);
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private generateEmailToken(
    email: string,
    password: string,
    firstName: string,
    familyName: string,
  ): JwtEmailToken {
    const payload: JwtEmailPayload = {
      email,
      password,
      firstName,
      familyName,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
    };
  }

  private generateTokens(user: User): JwtTokens {
    const payload: JwtPayload = {
      sub: user.id,
      username: `test-username-${user.id}`,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
