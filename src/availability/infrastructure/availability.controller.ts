import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { AvailabilityService } from '../application/availability.service';
import { Availability } from '../domain/availability.entity';
import { AddAvailabilityDto } from './dto/add-availability.dto';
import {
  findAvailabilitiesInRangeDto,
  findAvailabilitiesInRangeResponseDto,
} from './dto/find-availabilities-in-range.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiCreatedResponse()
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard)
  async addAvailability(
    @Body() body: AddAvailabilityDto,
    @Req() req: Request,
  ): Promise<void> {
    try {
      await this.availabilityService.create(
        req.user!.sub,
        body.from,
        body.to,
        body.pricePerHour,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @ApiOkResponse({ type: findAvailabilitiesInRangeResponseDto, isArray: true })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @Get()
  async findAvailabilitiesInRange(
    @Query() query: findAvailabilitiesInRangeDto,
  ): Promise<Availability[]> {
    try {
      return await this.availabilityService.findManyInTimeRange(
        query.sellerId,
        query.from,
        query.to,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
