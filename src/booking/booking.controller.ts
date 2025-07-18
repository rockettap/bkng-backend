import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Logger,
  Post,
  RawBodyRequest,
  Query,
  Req,
  Res,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { BookingService, stripe } from './booking.service';
import { Request, response, Response } from 'express';
import Stripe from 'stripe';

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async addBooking(
    @Body() body: { userId: number; from: string; to: string },
    // @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.userId || !body.from || !body.to) {
      throw new BadRequestException();
    }

    const from = new Date(body.from);
    const to = new Date(body.to);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestException();
    }

    const url = await this.bookingService.create(body.userId, from, to);
    return { url };
    // return res.redirect(url);
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    if (!req.rawBody) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        'whsec_ALp91SU9dRr95EfrQnUt4z1SWggLmFey',
      );
    } catch (err) {
      this.logger.error(err);
      return response.status(HttpStatus.BAD_REQUEST).send();
    }

    // TODO: move the logic to the service
    if (event.type === 'checkout.session.completed') {
      this.logger.log({
        'checkout.session.completed': event.data.object.metadata,
      });

      await this.bookingService.confirm(
        Number(event.data.object.metadata!.booking_id),
      );
    }
    if (event.type === 'checkout.session.expired') {
      this.logger.log({
        'checkout.session.expired': event.data.object.metadata,
      });

      await this.bookingService.cancel(
        Number(event.data.object.metadata!.booking_id),
      );
    }

    return res.status(HttpStatus.OK).send();
  }

  // Expire a Checkout Session
  @Get('temp')
  async temp(@Query('session') session: string) {
    await this.bookingService.temp(session);
  }
}
