import { Inject, Injectable, Logger } from '@nestjs/common';
import { Booking } from 'src/booking/domain/booking.entity';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { CalendarService } from '../domain/calendar-service.interface';
import { CALENDAR_SERVICES } from './tokens';

@Injectable()
export class CalendarOrchestrator {
  private readonly logger = new Logger(CalendarOrchestrator.name);

  constructor(
    @Inject(CALENDAR_SERVICES) private readonly services: CalendarService[],
  ) {}

  async createEvents(booking: Booking, email?: Email): Promise<void> {
    await Promise.all(
      this.services.map(async (service) => {
        try {
          await service.createEvent(booking, email);
        } catch (error) {
          if (error instanceof Error) {
            this.logger.warn(
              `Skipping service ${error.message} for booking ${booking.id}...`,
            );
            return;
          }
          throw error;
        }
      }),
    );
  }
}
