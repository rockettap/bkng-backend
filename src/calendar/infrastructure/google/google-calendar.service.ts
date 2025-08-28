import { Inject, Logger } from '@nestjs/common';
import { Auth, google } from 'googleapis';
import { Booking } from 'src/booking/booking.entity';
import { Email } from 'src/users/value-objects/email.vo';
import { GOOGLE_CALENDAR_INTEGRATION_REPOSITORY } from '../../application/tokens';
import { GoogleCalendarIntegration } from '../../domain/google/google-calendar-integration.entity';
import { GoogleCalendarIntegrationRepository } from '../../domain/google/google-calendar-repository.interface';
import { CalendarService } from '../calendar-service.interface';

export class GoogleCalendarService implements CalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    @Inject(GOOGLE_CALENDAR_INTEGRATION_REPOSITORY)
    private readonly googleCalendarIntegrationRepository: GoogleCalendarIntegrationRepository,
  ) {}

  async createEvent(booking: Booking, email?: Email): Promise<void> {
    const { oauth2Client } = await this.getOAuth2Client(booking.userId);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
      start: {
        dateTime: booking.from.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: booking.to.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: booking.id.toString(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      ...(email && {
        attendees: [{ email: email.value }],
      }),
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      reminders: {
        useDefault: false,
        overrides: [],
      },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'none',
    });
  }

  private async getOAuth2Client(userId: number): Promise<{
    oauth2Client: Auth.OAuth2Client;
    integration: GoogleCalendarIntegration;
  }> {
    const integration =
      await this.googleCalendarIntegrationRepository.findByUserId(userId);
    if (!integration) {
      throw new Error(GoogleCalendarService.name);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) integration.refreshToken = tokens.refresh_token;
      if (tokens.access_token) integration.accessToken = tokens.access_token;

      this.googleCalendarIntegrationRepository
        .update(integration)
        .catch((e) => this.logger.error(e));
    });

    return { oauth2Client, integration };
  }
}
