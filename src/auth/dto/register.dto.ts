import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'sasha386058@gmail.com' })
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty({ example: '_0Aqwert' })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Anastasia' })
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Yevhen' })
  readonly familyName: string;
}
