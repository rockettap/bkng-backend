import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe/stripe.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    try {
      await this.stripeService.handleEvent(req.rawBody, signature);

      return res.status(HttpStatus.OK).send();
    } catch {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Get('stripe/connect')
  @UseGuards(JwtAuthGuard)
  async connectStripe(
    @Req()
    req: Request & { user: { username: string; userId: number } },
  ) {
    const url = await this.stripeService.createAccountLink(req.user.userId);

    return { url };
  }
}
