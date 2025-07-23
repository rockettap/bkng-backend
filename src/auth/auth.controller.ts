import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { BookingService } from 'src/booking/booking.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly bookingService: BookingService,
    private readonly usersService: UsersService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  redirectToGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(
    @Req()
    req: Request & { user: { access_token: string; refresh_token: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = req.user;

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { access_token };
  }

  @Post('register')
  async signUp(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } = await this.authService.signUp(
      body.email,
      body.password,
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { access_token };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } = await this.authService.signIn(
      body.email,
      body.password,
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { access_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken: string = req.cookies?.['refresh_token'];

    const {
      access_token: updatedAccessToken,
      refresh_token: updatedRefreshToken,
    } = await this.authService.refreshToken(refreshToken);

    res.cookie('refresh_token', updatedRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { access_token: updatedAccessToken };
  }
}
