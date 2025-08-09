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

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addAvailability(
    @Body() body: { from: string; to: string; pricePerHour: number },
    @Req() req: Request & { user: JwtPayload },
  ): Promise<void> {
    if (!body.from || !body.to || !body.pricePerHour) {
      throw new BadRequestException();
    }

    const from = new Date(body.from);
    const to = new Date(body.to);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestException();
    }

    try {
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
  async findManyInRange(
    @Query('userId') userId: string,
    @Query('from') fromStr: string,
    @Query('to') toStr: string,
  ): Promise<Availability[]> {
    if (!fromStr || !toStr || !userId) {
      throw new BadRequestException();
    }

    const from = new Date(fromStr);
    const to = new Date(toStr);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestException();
    }

    return await this.availabilityService.findManyInRange(
      Number(userId),
      from,
      to,
    );
  }
}
