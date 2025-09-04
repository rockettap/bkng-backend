import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from 'passport-google-oauth20';
import { MailService } from 'src/mail/mail.service';
import { SellerService } from 'src/seller/application/seller.service';
import { EmailAuth, Seller } from 'src/seller/domain/seller.entity';
import { SellerFactory } from 'src/seller/domain/seller.factory';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { Profile as DomainProfile } from 'src/seller/domain/value-objects/profile.vo';
import { JwtEmailPayload } from './types/jwt-email-payload.type';
import { JwtEmailToken } from './types/jwt-email-token.type';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtTokens } from './types/jwt-tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly sellerService: SellerService,
  ) {}

  async validateGoogleLogin(profile: Profile): Promise<JwtTokens> {
    const seller = await this.sellerService.findByGoogleId(profile.id);
    if (!seller) {
      const newSeller = await this.sellerService.create(
        SellerFactory.createWithGoogle(
          new DomainProfile(
            profile._json.given_name,
            profile._json.family_name,
            profile._json.picture ? new URL(profile._json.picture) : undefined,
          ),
          profile._json.sub,
        ),
      );

      return this.generateTokens(newSeller);
    }

    return this.generateTokens(seller);
  }

  async signUp(
    email: string,
    password: string,
    firstName: string,
    familyName: string,
  ) {
    const seller = await this.sellerService.findByEmail(email);
    if (seller) {
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
    try {
      const decoded = this.jwtService.verify<JwtEmailPayload>(access_token);

      return await this.createSeller(
        decoded.email,
        decoded.password,
        decoded.firstName,
        decoded.familyName,
      );
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createSeller(
    email: string,
    password: string,
    firstName: string,
    familyName: string,
  ): Promise<JwtTokens> {
    const passwordHash = await bcrypt.hash(password, 10);
    const seller = await this.sellerService.create(
      SellerFactory.createWithEmail(
        new DomainProfile(firstName, familyName),
        new Email(email),
        passwordHash,
      ),
    );

    return this.generateTokens(seller);
  }

  async signIn(email: string, password: string): Promise<JwtTokens> {
    const seller = await this.sellerService.findByEmailOrThrow(email);

    if (!(seller.auth instanceof EmailAuth)) {
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(password, seller.auth.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(seller);
  }

  async refreshToken(refresh_token: string): Promise<JwtTokens> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refresh_token);

      const seller = await this.sellerService.findByIdOrThrow(decoded.sub);

      return this.generateTokens(seller);
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

  private generateTokens(seller: Seller): JwtTokens {
    const payload: JwtPayload = {
      sub: seller.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
