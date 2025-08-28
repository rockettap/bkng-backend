import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber } from 'class-validator';

export class findAvailabilitiesInRangeDto {
  @IsInt()
  @ApiProperty()
  readonly userId: number;

  @IsDateString()
  @ApiProperty()
  readonly from: Date;

  @IsDateString()
  @ApiProperty()
  readonly to: Date;
}

export class findAvailabilitiesInRangeResponseDto {
  @IsDateString()
  @ApiProperty()
  readonly from: Date;

  @IsDateString()
  @ApiProperty()
  readonly to: Date;

  @IsNumber()
  @ApiProperty({ default: 1 })
  readonly pricePerHour: number;
}
