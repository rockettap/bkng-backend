import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  readonly message: string | string[];

  @ApiProperty({
    required: false,
  })
  readonly error?: string;

  @ApiProperty()
  readonly statusCode: number;
}
