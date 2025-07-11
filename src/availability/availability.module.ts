import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityService } from './availability.service';
import { PrismaAvailabilityRepository } from './availability.repository';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    AvailabilityService,
    {
      provide: 'AvailabilityRepository',
      useClass: PrismaAvailabilityRepository,
    },
  ],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
