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
import { DomainError } from 'src/common/errors/domain.error';
import { SellerNotFoundError } from 'src/seller/domain/errors/seller-not-found.error';
import { BookingService } from '../application/booking.service';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { BookingOutsideAvailabilityError } from '../domain/errors/booking-outside-availability.error';
import { BookingOverlapError } from '../domain/errors/booking-overlap.error';
import { BookingPaymentFailedError } from '../domain/errors/booking-payment-failed.error';
import { AddBookingDto } from './dto/add-booking.dto';

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
        body.sellerId,
        body.from,
        body.to,
      );
      return { url };
    } catch (error) {
      if (
        error instanceof SellerNotFoundError ||
        error instanceof BookingNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BookingOverlapError) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof BookingOutsideAvailabilityError ||
        error instanceof DomainError
      ) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof BookingPaymentFailedError) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }
  }
}
