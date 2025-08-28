import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CalendarOrchestrator } from './application/calendar.orchestrator';
import {
  APPLE_CALENDAR_INTEGRATION_REPOSITORY,
  CALENDAR_SERVICES,
  GOOGLE_CALENDAR_INTEGRATION_REPOSITORY,
} from './application/tokens';
import { PrismaAppleCalendarRepository as PrismaAppleCalendarIntegrationRepository } from './infrastructure/apple/apple-calendar-integration.repository';
import { AppleCalendarService } from './infrastructure/apple/apple-calendar.service';
import { CalendarController } from './infrastructure/calendar.controller';
import { PrismaGoogleCalendarRepository as PrismaGoogleCalendarIntegrationRepository } from './infrastructure/google/google-calendar-integration.repository';
import { GoogleCalendarService } from './infrastructure/google/google-calendar.service';

@Module({
  imports: [PrismaModule],
  providers: [
    GoogleCalendarService,
    AppleCalendarService,
    {
      provide: CALENDAR_SERVICES,
      useFactory: (
        googleCalendar: GoogleCalendarService,
        appleCalendar: AppleCalendarService,
      ) => [googleCalendar, appleCalendar],
      inject: [GoogleCalendarService, AppleCalendarService],
    },
    {
      provide: GOOGLE_CALENDAR_INTEGRATION_REPOSITORY,
      useClass: PrismaGoogleCalendarIntegrationRepository,
    },
    {
      provide: APPLE_CALENDAR_INTEGRATION_REPOSITORY,
      useClass: PrismaAppleCalendarIntegrationRepository,
    },
    CalendarOrchestrator,
  ],
  controllers: [CalendarController],
  exports: [CalendarOrchestrator],
})
export class CalendarModule {}
