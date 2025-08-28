import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { GoogleAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtTokens } from './types/jwt-tokens.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiFoundResponse()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  redirectToGoogle() {}

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(
    @Req()
    req: Request & { user: JwtTokens },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = req.user;

    this.setRefreshTokenCookie(res, refresh_token);

    return { access_token };
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Post('register')
  async signUp(
    @Body()
    body: RegisterDto,
  ) {
    await this.authService.signUp(
      body.email,
      body.password,
      body.firstName,
      body.familyName,
    );
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } =
      await this.authService.verify(token);

    this.setRefreshTokenCookie(res, refresh_token);

    return { access_token };
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } = await this.authService.signIn(
      body.email,
      body.password,
    );

    this.setRefreshTokenCookie(res, refresh_token);

    return { access_token };
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
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

    this.setRefreshTokenCookie(res, updatedRefreshToken);

    return { access_token: updatedAccessToken };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  }
}
