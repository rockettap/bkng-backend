import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async addBooking(@Body() body: { userId: number; from: string; to: string }) {
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
  }
}
