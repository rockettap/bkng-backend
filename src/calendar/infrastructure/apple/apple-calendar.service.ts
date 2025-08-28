import { Inject, Logger } from '@nestjs/common';
import { Booking } from 'src/booking/booking.entity';
import { APPLE_CALENDAR_INTEGRATION_REPOSITORY } from 'src/calendar/application/tokens';
import { AppleCalendarIntegrationRepository } from 'src/calendar/domain/apple/apple-calendar-repository.interface';
import { Email } from 'src/users/value-objects/email.vo';
import { CalendarService } from '../calendar-service.interface';

export class AppleCalendarService implements CalendarService {
  private readonly logger = new Logger(AppleCalendarService.name);

  constructor(
    @Inject(APPLE_CALENDAR_INTEGRATION_REPOSITORY)
    private readonly appleCalendarIntegrationRepository: AppleCalendarIntegrationRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async createEvent(booking: Booking, email?: Email): Promise<void> {
    this.logger.log(booking);
  }
}
