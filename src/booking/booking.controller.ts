import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async addBooking(@Body() body: { userId: number; from: string; to: string }) {
    if (typeof body.userId !== 'number' || !body.from || !body.to) {
      throw new BadRequestException();
    }

    const from = new Date(body.from);
    const to = new Date(body.to);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestException();
    }

    try {
      const url = await this.bookingService.create(body.userId, from, to);

      return { url };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
