import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { SellerService } from '../application/seller.service';
import { SellerNotFoundError } from '../domain/errors/seller-not-found.error';

@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @ApiOkResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.sellerService.findByIdOrThrow(id);
    } catch (error) {
      if (error instanceof SellerNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: Request) {
    try {
      const seller = await this.sellerService.findByIdOrThrow(req.user!.sub);

      await this.sellerService.delete(seller);
    } catch (error) {
      if (error instanceof SellerNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
