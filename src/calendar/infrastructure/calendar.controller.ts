import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { SellerService } from 'src/seller/application/seller.service';
import { GOOGLE_CALENDAR_INTEGRATION_REPOSITORY } from '../application/tokens';
import { GoogleCalendarIntegration } from '../domain/google/google-calendar-integration.entity';
import { GoogleCalendarIntegrationRepository } from '../domain/google/google-calendar-repository.interface';

@Controller('calendar')
export class CalendarController {
  private readonly oauth2Client: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly sellerService: SellerService,
    @Inject(GOOGLE_CALENDAR_INTEGRATION_REPOSITORY)
    private readonly googleCalendarIntegrationRepository: GoogleCalendarIntegrationRepository,
    private readonly jwtService: JwtService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow<string>('GOOGLE_CALENDAR_REDIRECT_URI'),
    );
  }

  @ApiFoundResponse()
  @Get('google')
  @UseGuards(JwtAuthGuard)
  redirectToGoogle(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload: JwtPayload = { sub: req.user!.sub };

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: this.jwtService.sign(payload, { expiresIn: '2m' }),
    });

    res.send({ url });

    // res.redirect(url);
  }

  @ApiOkResponse()
  @Get('google/callback')
  @UseGuards(JwtAuthGuard)
  async handleGoogleCallback(
    @Req() req: Request,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const seller = await this.sellerService.findByIdOrThrow(req.user!.sub);

    const tokens = (await this.oauth2Client.getToken(code)).tokens;
    if (!tokens.access_token) {
      throw new Error();
    }

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token ?? undefined;

    let googleCalendarIntegration =
      await this.googleCalendarIntegrationRepository.findBySellerId(seller.id);

    if (googleCalendarIntegration) {
      googleCalendarIntegration.accessToken = accessToken;
      googleCalendarIntegration.refreshToken = refreshToken;

      await this.googleCalendarIntegrationRepository.update(
        googleCalendarIntegration,
      );
    } else {
      googleCalendarIntegration = new GoogleCalendarIntegration(
        0,
        seller.id,
        accessToken,
        refreshToken,
      );

      await this.googleCalendarIntegrationRepository.create(
        googleCalendarIntegration,
      );
    }
  }
}
