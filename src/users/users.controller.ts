import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findOne(@Param('id') id: string) {
    return null;
  }
}
