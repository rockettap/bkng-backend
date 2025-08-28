import { Controller, Get } from '@nestjs/common';

@Controller('calendar')
export class CalendarController {
  constructor() {}

  @Get('google')
  redirectToGoogle() {}

  @Get('google/callback')
  handleGoogleCallback() {}

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // redirectToGoogle(
  //   @Req() req: Request & { user: JwtPayload },
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const url = this.googleService.generateAuthUrl(req.user.sub);

  //   res.redirect(url);
  // }

  // @Get('callback')
  // @UseGuards(JwtAuthGuard)
  // async handleGoogleCallback(
  //   @Query('code') code: string,
  //   @Query('state') state: string,
  // ) {
  //   const tokens = await this.googleService.exchangeCodeForTokens(code, state);

  //   this.logger.debug(tokens);
  // }
}
