import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'sasha386058@gmail.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '_0Aqwert' })
  @IsString()
  readonly password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  readonly access_token: string;
}
