import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class AddBookingDto {
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
