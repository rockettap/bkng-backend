import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthGuard } from './auth.guard';

@Controller('auth/google')
export class AuthController {
  @Get()
  @UseGuards(GoogleAuthGuard)
  redirectToGoogle() {}

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(@Req() req: Request) {
    return req.user;
  }
}
