import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellerRepository } from '../domain/seller-repository.interface';
import {
  EmailAuth as DomainEmailAuth,
  GoogleAuth as DomainGoogleAuth,
  Seller as DomainSeller,
} from '../domain/seller.entity';
import { SellerFactory } from '../domain/seller.factory';
import { Email } from '../domain/value-objects/email.vo';
import { Profile } from '../domain/value-objects/profile.vo';

type UserWithAuth = Prisma.UserGetPayload<{
  include: { emailAuthMethod: true; googleAuthMethod: true };
}>;

@Injectable()
export class PrismaSellerRepository implements SellerRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainSeller | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        emailAuthMethod: true,
        googleAuthMethod: true,
      },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<DomainSeller | null> {
    const prismaEmailAuth = await this.prisma.emailAuthMethod.findUnique({
      where: { email },
      include: {
        user: { include: { emailAuthMethod: true, googleAuthMethod: true } },
      },
    });
    return prismaEmailAuth ? this.toDomain(prismaEmailAuth.user) : null;
  }

  async findByGoogleId(googleId: string): Promise<DomainSeller | null> {
    const prismaGoogleAuth = await this.prisma.googleAuthMethod.findUnique({
      where: { googleId },
      include: {
        user: { include: { emailAuthMethod: true, googleAuthMethod: true } },
      },
    });
    return prismaGoogleAuth ? this.toDomain(prismaGoogleAuth.user) : null;
  }

  async create(seller: DomainSeller): Promise<DomainSeller> {
    const createdPrismaUser = await this.prisma.user.create({
      data: {
        firstName: seller.profile.firstName ?? undefined,
        familyName: seller.profile.familyName ?? undefined,
        avatarUrl: seller.profile.avatarUrl ?? undefined,
        stripeId: seller.stripeId ?? undefined,
        emailAuthMethod:
          seller.auth instanceof DomainEmailAuth
            ? {
                create: {
                  email: seller.auth.id,
                  passwordHash: seller.auth.passwordHash,
                },
              }
            : undefined,
        googleAuthMethod:
          seller.auth instanceof DomainGoogleAuth
            ? {
                create: {
                  googleId: seller.auth.id,
                },
              }
            : undefined,
      },
      include: {
        emailAuthMethod: true,
        googleAuthMethod: true,
      },
    });
    return this.toDomain(createdPrismaUser);
  }

  async update(seller: DomainSeller): Promise<DomainSeller> {
    const updatedPrismaUser = await this.prisma.user.update({
      where: { id: seller.id },
      data: {
        firstName: seller.profile.firstName ?? undefined,
        familyName: seller.profile.familyName ?? undefined,
        avatarUrl: seller.profile.avatarUrl ?? undefined,
        stripeId: seller.stripeId ?? undefined,
        emailAuthMethod:
          seller.auth instanceof DomainEmailAuth
            ? {
                update: {
                  email: seller.auth.id,
                  passwordHash: seller.auth.passwordHash,
                },
              }
            : undefined,
        googleAuthMethod:
          seller.auth instanceof DomainGoogleAuth
            ? {
                update: {
                  googleId: seller.auth.id,
                },
              }
            : undefined,
      },
      include: {
        emailAuthMethod: true,
        googleAuthMethod: true,
      },
    });

    return this.toDomain(updatedPrismaUser);
  }

  async delete(seller: DomainSeller): Promise<boolean> {
    const deletedPrismaUser = await this.prisma.user.delete({
      where: {
        id: seller.id,
      },
    });
    return deletedPrismaUser ? true : false;
  }

  private toDomain(user: UserWithAuth): DomainSeller {
    if (user.emailAuthMethod) {
      return SellerFactory.createWithEmail(
        new Profile(user.firstName ?? undefined, user.familyName ?? undefined),
        new Email(user.emailAuthMethod.email),
        user.emailAuthMethod.passwordHash,
        user.stripeId ?? undefined,
        user.id,
      );
    } else if (user.googleAuthMethod) {
      return SellerFactory.createWithGoogle(
        new Profile(user.firstName ?? undefined, user.familyName ?? undefined),
        user.googleAuthMethod.googleId,
        user.stripeId ?? undefined,
        user.id,
      );
    } else {
      throw new Error();
    }
  }
}
