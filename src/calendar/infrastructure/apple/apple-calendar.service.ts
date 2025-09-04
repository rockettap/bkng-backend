import { Inject } from '@nestjs/common';
import { Booking } from 'src/booking/domain/booking.entity';
import { APPLE_CALENDAR_INTEGRATION_REPOSITORY } from 'src/calendar/application/tokens';
import { AppleCalendarIntegrationRepository } from 'src/calendar/domain/apple/apple-calendar-repository.interface';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { CalendarService } from '../../domain/calendar-service.interface';

export class AppleCalendarService implements CalendarService {
  constructor(
    @Inject(APPLE_CALENDAR_INTEGRATION_REPOSITORY)
    private readonly appleCalendarIntegrationRepository: AppleCalendarIntegrationRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async createEvent(booking: Booking, email?: Email): Promise<void> {
    throw new Error(AppleCalendarService.name);
  }
}
