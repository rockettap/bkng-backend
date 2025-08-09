import {
  Controller,
  Get,
  Logger,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { GoogleCalendarService } from './google-calendar.service';

@Controller('google-calendar')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly googleService: GoogleCalendarService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  redirectToGoogle(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    const url = this.googleService.generateAuthUrl(req.user.sub);

    res.redirect(url);
  }

  @Get('callback')
  @UseGuards(JwtAuthGuard)
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const tokens = await this.googleService.getTokensFromCode(code, state);

    this.logger.debug(tokens);
  }
}
