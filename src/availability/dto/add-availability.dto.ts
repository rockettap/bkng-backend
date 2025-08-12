import { IsDateString, IsInt } from 'class-validator';

export class AddAvailabilityDto {
  @IsDateString()
  readonly from: string;

  @IsDateString()
  readonly to: string;

  @IsInt()
  readonly pricePerHour: number;
}
