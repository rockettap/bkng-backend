import { Injectable } from '@nestjs/common';
import { GoogleCalendarIntegration as DomainGoogleCalendarIntegration } from 'src/calendar/domain/google/google-calendar-integration.entity';
import { GoogleCalendarIntegrationRepository } from 'src/calendar/domain/google/google-calendar-repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaGoogleCalendarRepository
  implements GoogleCalendarIntegrationRepository
{
  constructor(private prisma: PrismaService) {}

  findById(id: number): Promise<DomainGoogleCalendarIntegration | null> {
    throw new Error('Method not implemented.');
  }

  findByUserId(
    userId: number,
  ): Promise<DomainGoogleCalendarIntegration | null> {
    throw new Error('Method not implemented.');
  }

  create(
    googleCalendarIntegration: DomainGoogleCalendarIntegration,
  ): Promise<DomainGoogleCalendarIntegration> {
    throw new Error('Method not implemented.');
  }

  update(
    googleCalendarIntegration: DomainGoogleCalendarIntegration,
  ): Promise<DomainGoogleCalendarIntegration> {
    throw new Error('Method not implemented.');
  }
}
