import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as DomainUser } from './user.entity';
import { UsersRepository } from './users-repository.interface';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainUser | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async findByGoogleId(sub: string): Promise<DomainUser | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { sub },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async create(user: DomainUser): Promise<DomainUser> {
    const createdPrismaUser = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        sub: user.googleId,
        firstName: user.profile.firstName,
        familyName: user.profile.familyName,
        avatarUrl: user.profile.avatarUrl,
      },
    });
    return this.toDomain(createdPrismaUser);
  }

  async update(user: DomainUser): Promise<DomainUser> {
    const updatedPrismaUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        sub: user.googleId,
        firstName: user.profile.firstName,
        familyName: user.profile.familyName,
        avatarUrl: user.profile.avatarUrl,
        stripeId: user.stripeId,
        // googleAccessToken: user.googleAccessToken,
        // googleRefreshToken: user.googleRefreshToken,
      },
    });
    return this.toDomain(updatedPrismaUser);
  }

  async delete(user: DomainUser): Promise<boolean> {
    const deletedPrismaUser = await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    return deletedPrismaUser ? true : false;
  }

  private toDomain(user: PrismaUser): DomainUser {
    if (user.email && user.passwordHash) {
      return DomainUser.createWithEmail(
        user.id,
        user.email,
        user.passwordHash,
        user.firstName ?? undefined,
        user.familyName ?? undefined,
        user.stripeId ?? undefined,
      );
    } else if (user.sub) {
      return DomainUser.createWithGoogle(
        user.id,
        user.sub,
        user.firstName ?? undefined,
        user.familyName ?? undefined,
        user.avatarUrl ?? undefined,
        user.stripeId ?? undefined,
        // user.googleAccessToken ?? undefined,
        // user.googleRefreshToken ?? undefined,
      );
    } else {
      throw new Error();
    }
  }
}
