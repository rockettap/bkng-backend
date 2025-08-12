import { IsDateString, IsInt } from 'class-validator';

export class findAvailabilitiesInRange {
  @IsInt()
  readonly userId: number;

  @IsDateString()
  readonly from: string;

  @IsDateString()
  readonly to: string;
}
