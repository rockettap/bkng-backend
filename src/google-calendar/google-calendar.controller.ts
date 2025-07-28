import { Controller, Get, Logger, Query } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';

@Controller('google-calendar')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly googleService: GoogleCalendarService) {}

  @Get()
  redirectToGoogle() {
    const url = this.googleService.generateAuthUrl();

    return { url };
  }

  @Get('callback')
  async handleGoogleCallback(@Query('code') code: string) {
    const tokens = await this.googleService.getTokensFromCode(code);

    this.logger.debug(JSON.stringify(tokens));
  }
}
