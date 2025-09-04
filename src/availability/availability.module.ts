import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityService } from './application/availability.service';
import { AVAILABILITY_REPOSITORY } from './application/tokens';
import { AvailabilityController } from './infrastructure/availability.controller';
import { PrismaAvailabilityRepository } from './infrastructure/availability.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    AvailabilityService,
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: PrismaAvailabilityRepository,
    },
  ],
  controllers: [AvailabilityController],
  exports: [AvailabilityService, AVAILABILITY_REPOSITORY],
})
export class AvailabilityModule {}
