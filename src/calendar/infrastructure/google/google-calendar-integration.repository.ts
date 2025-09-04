import { Injectable } from '@nestjs/common';
import { GoogleCalendarIntegration as PrismaGoogleCalendarIntegration } from 'generated/prisma';
import { GoogleCalendarIntegration as DomainGoogleCalendarIntegration } from 'src/calendar/domain/google/google-calendar-integration.entity';
import { GoogleCalendarIntegrationRepository } from 'src/calendar/domain/google/google-calendar-repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaGoogleCalendarRepository
  implements GoogleCalendarIntegrationRepository
{
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<DomainGoogleCalendarIntegration | null> {
    const googleCalendarIntegration =
      await this.prisma.googleCalendarIntegration.findUnique({
        where: { id },
      });
    return googleCalendarIntegration
      ? this.toDomain(googleCalendarIntegration)
      : null;
  }

  async findBySellerId(
    sellerId: number,
  ): Promise<DomainGoogleCalendarIntegration | null> {
    const googleCalendarIntegration =
      await this.prisma.googleCalendarIntegration.findUnique({
        where: { sellerId },
      });
    return googleCalendarIntegration
      ? this.toDomain(googleCalendarIntegration)
      : null;
  }

  async create(
    googleCalendarIntegration: DomainGoogleCalendarIntegration,
  ): Promise<DomainGoogleCalendarIntegration> {
    const created = await this.prisma.googleCalendarIntegration.create({
      data: {
        sellerId: googleCalendarIntegration.sellerId,
        accessToken: googleCalendarIntegration.accessToken,
        refreshToken: googleCalendarIntegration.refreshToken,
      },
    });
    return this.toDomain(created);
  }

  async update(
    googleCalendarIntegration: DomainGoogleCalendarIntegration,
  ): Promise<DomainGoogleCalendarIntegration> {
    const updated = await this.prisma.googleCalendarIntegration.update({
      where: { id: googleCalendarIntegration.id },
      data: {
        accessToken: googleCalendarIntegration.accessToken,
        refreshToken: googleCalendarIntegration.refreshToken,
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(
    googleCalendarIntegration: PrismaGoogleCalendarIntegration,
  ): DomainGoogleCalendarIntegration {
    return new DomainGoogleCalendarIntegration(
      googleCalendarIntegration.id,
      googleCalendarIntegration.sellerId,
      googleCalendarIntegration.accessToken,
      googleCalendarIntegration.refreshToken ?? undefined,
    );
  }
}
