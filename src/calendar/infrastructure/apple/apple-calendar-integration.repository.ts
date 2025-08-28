import { Injectable } from '@nestjs/common';
import { AppleCalendarIntegration as PrismaAppleCalendarIntegration } from 'generated/prisma';
import { AppleCalendarIntegration as DomainAppleCalendarIntegration } from 'src/calendar/domain/apple/apple-calendar-integration.entity';
import { AppleCalendarIntegrationRepository } from 'src/calendar/domain/apple/apple-calendar-repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaAppleCalendarRepository
  implements AppleCalendarIntegrationRepository
{
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainAppleCalendarIntegration | null> {
    const appleCalendarIntegration =
      await this.prisma.appleCalendarIntegration.findUnique({
        where: { id },
      });
    return appleCalendarIntegration
      ? this.toDomain(appleCalendarIntegration)
      : null;
  }

  async findByUserId(
    userId: number,
  ): Promise<DomainAppleCalendarIntegration | null> {
    const appleCalendarIntegration =
      await this.prisma.appleCalendarIntegration.findFirst({
        where: { userId },
      });
    return appleCalendarIntegration
      ? this.toDomain(appleCalendarIntegration)
      : null;
  }

  async create(
    appleCalendarIntegration: DomainAppleCalendarIntegration,
  ): Promise<DomainAppleCalendarIntegration> {
    const createdAppleCalendarIntegration =
      await this.prisma.appleCalendarIntegration.create({
        data: {
          id: appleCalendarIntegration.id,
          userId: appleCalendarIntegration.userId,
          username: appleCalendarIntegration.username,
          password: appleCalendarIntegration.password,
        },
      });
    return this.toDomain(createdAppleCalendarIntegration);
  }

  private toDomain(
    appleCalendarIntegration: PrismaAppleCalendarIntegration,
  ): DomainAppleCalendarIntegration {
    return new DomainAppleCalendarIntegration(
      appleCalendarIntegration.id,
      appleCalendarIntegration.userId,
      appleCalendarIntegration.username,
      appleCalendarIntegration.password,
    );
  }
}
