import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { PrismaUsersRepository } from './users.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersService,
    {
      provide: 'UsersRepository',
      useClass: PrismaUsersRepository,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
