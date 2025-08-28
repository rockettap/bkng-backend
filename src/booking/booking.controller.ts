import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { DomainException } from 'src/common/exceptions/domain.exception';
import { UserNotFoundException } from 'src/users/exceptions/user-not-found.exception';
import { BookingService } from './booking.service';
import { AddBookingDto } from './dto/add-booking.dto';
import { BookingNotFoundException } from './exceptions/booking-not-found.exception';
import { BookingOutsideAvailabilityException } from './exceptions/booking-outside-availability.exception';
import { BookingOverlapException } from './exceptions/booking-overlap.exception';
import { BookingPaymentFailedException } from './exceptions/booking-payment-failed.exception';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiCreatedResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiBadGatewayResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Post()
  async addBooking(@Body() body: AddBookingDto) {
    try {
      const url = await this.bookingService.create(
        body.userId,
        body.from,
        body.to,
      );
      return { url };
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof BookingNotFoundException
      ) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BookingOverlapException) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof BookingOutsideAvailabilityException ||
        error instanceof DomainException
      ) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof BookingPaymentFailedException) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }
  }
}
