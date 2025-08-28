import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'sasha386058@gmail.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '_0Aqwert' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string;

  @ApiProperty({ example: 'Yevhen' })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({ example: 'Kornijchuk' })
  @IsString()
  @IsNotEmpty()
  readonly familyName: string;
}
