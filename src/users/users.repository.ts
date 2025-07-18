import { PrismaService } from 'src/prisma/prisma.service';
import { User as DomainUser } from './user.entity';
import { User as PrismaUser } from 'generated/prisma';
import { UsersRepository } from './users-repository.interface';
import { Injectable } from '@nestjs/common';

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

  async findBySub(sub: string): Promise<DomainUser | null> {
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
        sub: user.sub,
      },
    });
    return this.toDomain(createdPrismaUser);
  }

  async update(user: DomainUser): Promise<DomainUser | null> {
    const updatedPrismaUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        sub: user.sub,
        stripeId: user.stripeId,
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
        user.stripeId ?? undefined,
      );
    } else if (user.sub) {
      return DomainUser.createWithGoogle(
        user.id,
        user.sub,
        user.stripeId ?? undefined,
      );
    } else {
      throw new Error();
    }
  }
}
