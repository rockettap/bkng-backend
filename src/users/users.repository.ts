import { PrismaService } from 'src/prisma/prisma.service';
import { User as DomainUser } from './user.entity';
import { User as PrismaUser } from 'generated/prisma';
import { UsersRepository } from './users-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<DomainUser | null> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByEmail(email: string): Promise<DomainUser | null> {
    throw new Error('Method not implemented.');
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

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(user: DomainUser): Promise<DomainUser | null> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(user: DomainUser): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  private toDomain(user: PrismaUser): DomainUser {
    if (user.email && user.passwordHash) {
      return DomainUser.createWithEmail(user.id, user.email, user.passwordHash);
    } else if (user.sub) {
      return DomainUser.createWithGoogle(user.id, user.sub);
    } else {
      throw new Error();
    }
  }
}
