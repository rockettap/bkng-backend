import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AddBookingDto } from './dto/add-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async addBooking(@Body() body: AddBookingDto) {
    try {
      const from = new Date(body.from);
      const to = new Date(body.to);

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
