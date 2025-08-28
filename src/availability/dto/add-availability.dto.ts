import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class AddAvailabilityDto {
  @IsDateString()
  @ApiProperty()
  readonly from: Date;

  @IsDateString()
  @ApiProperty()
  readonly to: Date;

  @IsInt()
  @ApiProperty({ default: 1 })
  readonly pricePerHour: number;
}
