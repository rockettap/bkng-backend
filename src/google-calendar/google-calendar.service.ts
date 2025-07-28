import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  generateAuthUrl(): string {
    const oauth2Client = this.createOAuthClient();

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar'],
    });
  }

  async getTokensFromCode(
    code: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const tokens = (await this.createOAuthClient().getToken(code)).tokens;

    if (!tokens.access_token || !tokens.refresh_token) throw new Error();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async createGoogleCalendarEvent(
    tokens: {
      access_token: string;
      refresh_token: string;
    },
    bookingId: number,
    start: Date,
    end: Date,
    email?: string,
  ) {
    const oauth2Client = this.createOAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      start: {
        dateTime: start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: bookingId.toString(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      ...(email && {
        attendees: [{ email }],
      }),
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      reminders: {
        useDefault: false,
        overrides: [],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'none',
    });

    this.logger.log({
      message: 'Google Calendar link',
      htmlLink: response.data.htmlLink,
    });
    this.logger.log({
      message: 'Google Meet link',
      uri: response.data.conferenceData?.entryPoints?.[0]?.uri,
    });

    return response.data;
  }

  private createOAuthClient(tokens?: {
    access_token: string;
    refresh_token: string;
  }) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    );

    if (tokens) {
      oauth2Client.setCredentials(tokens);
    }

    return oauth2Client;
  }
}
