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
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';
import { AddAvailabilityDto } from './dto/add-availability.dto';
import { findAvailabilitiesInRange } from './dto/find-availabilities-in-range.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addAvailability(
    @Body() body: AddAvailabilityDto,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<void> {
    try {
      const from = new Date(body.from);
      const to = new Date(body.to);

      await this.availabilityService.create(
        req.user.sub,
        from,
        to,
        body.pricePerHour,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async findAvailabilitiesInRange(
    @Query() query: findAvailabilitiesInRange,
  ): Promise<Availability[]> {
    try {
      const from = new Date(query.from);
      const to = new Date(query.to);

      return await this.availabilityService.findManyInRange(
        query.userId,
        from,
        to,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
