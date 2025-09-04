import { EmailAuth, GoogleAuth, Seller } from './seller.entity';
import { Email } from './value-objects/email.vo';
import { Profile } from './value-objects/profile.vo';

export class SellerFactory {
  static createWithEmail(
    profile: Profile,
    email: Email,
    passwordHash: string,
    stripeId?: string,
    id?: number,
  ): Seller {
    const auth = new EmailAuth(email, passwordHash);
    return new Seller(id ?? 0, profile, auth, stripeId);
  }

  static createWithGoogle(
    profile: Profile,
    googleId: string,
    stripeId?: string,
    id?: number,
  ): Seller {
    const auth = new GoogleAuth(googleId);
    return new Seller(id ?? 0, profile, auth, stripeId);
  }
}
