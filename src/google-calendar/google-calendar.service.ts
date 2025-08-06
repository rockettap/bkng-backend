import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { google } from 'googleapis';
import { JwtTokens } from 'src/auth/types/jwt-tokens.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  generateAuthUrl(userId: number): string {
    const oauth2Client = this.createOAuthClient();

    const payload = { sub: userId, username: `test-username-${userId}` };

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: this.jwtService.sign(payload, { expiresIn: '1m' }),
    });
  }

  async getTokensFromCode(code: string, token: string): Promise<JwtTokens> {
    const tokens = (await this.createOAuthClient().getToken(code)).tokens;

    if (!tokens.access_token || !tokens.refresh_token) throw new Error();

    const decoded = this.jwtService.verify<JwtPayload>(token);

    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new Error();
    }

    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;

    await this.usersService.update(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async createGoogleCalendarEvent(
    tokens: JwtTokens,
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

  private createOAuthClient(tokens?: JwtTokens) {
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
