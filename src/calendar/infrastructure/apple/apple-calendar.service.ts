import { Inject, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Booking } from 'src/booking/domain/booking.entity';
import { APPLE_CALENDAR_INTEGRATION_REPOSITORY } from 'src/calendar/application/tokens';
import { AppleCalendarIntegration } from 'src/calendar/domain/apple/apple-calendar-integration.entity';
import { AppleCalendarIntegrationRepository } from 'src/calendar/domain/apple/apple-calendar-repository.interface';
import { Email } from 'src/seller/domain/value-objects/email.vo';
import { CalendarService } from '../../domain/calendar-service.interface';

export class AppleCalendarService implements CalendarService {
  private readonly logger = new Logger(AppleCalendarService.name);

  constructor(
    @Inject(APPLE_CALENDAR_INTEGRATION_REPOSITORY)
    private readonly appleCalendarIntegrationRepository: AppleCalendarIntegrationRepository,
  ) {}

  async createEvent(booking: Booking, email?: Email): Promise<void> {
    throw new Error('Not implemented.');

    const { client } = await this.getClient(booking.sellerId);

    const uid = booking.id;
    const event = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${uid}
DTSTAMP:20250905T120000Z
DTSTART:20250907T140000Z
DTEND:20250907T150000Z
SUMMARY:Meeting with Apple
END:VEVENT
END:VCALENDAR
`;

    const calendarPath = '/<user-id>/calendars/<calendar-name>';
    const url = `${client.defaults.baseURL}${calendarPath}/${uid}.ics`;

    await client.put(url, event, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
      },
    });
  }

  private async getClient(
    sellerId: number,
  ): Promise<{ client: AxiosInstance; integration: AppleCalendarIntegration }> {
    const integration =
      await this.appleCalendarIntegrationRepository.findBySellerId(sellerId);
    if (!integration) {
      throw new Error(AppleCalendarService.name);
    }

    const client = axios.create({
      baseURL: 'https://caldav.icloud.com',
      auth: {
        username: integration.username,
        password: integration.password,
      },
      headers: {
        'Content-Type': 'application/xml; charset="UTF-8"',
      },
    });

    return { client, integration };
  }
}
