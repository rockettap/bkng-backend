import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'sasha386058@gmail.com' })
  readonly email: string;

  @IsString()
  @ApiProperty({ example: '_0Aqwert' })
  readonly password: string;
}
