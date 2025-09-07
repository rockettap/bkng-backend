import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from 'src/auth/auth.module';
import { BookingModule } from 'src/booking/booking.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SellerModule } from 'src/seller/seller.module';
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
  imports: [
    SellerModule,
    PrismaModule,
    AuthModule,
    forwardRef(() => BookingModule),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALENDAR_REDIRECT_URI: Joi.string().required(),
      }),
    }),
  ],
  providers: [
    GoogleCalendarService,
    AppleCalendarService,
    {
      provide: CALENDAR_SERVICES,
      useFactory: () => ({
        googleCalendar: GoogleCalendarService,
        appleCalendar: AppleCalendarService,
      }),
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
