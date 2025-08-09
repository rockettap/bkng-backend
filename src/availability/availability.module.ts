import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityController } from './availability.controller';
import { PrismaAvailabilityRepository } from './availability.repository';
import { AvailabilityService } from './availability.service';

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
  exports: [AvailabilityService, 'AvailabilityRepository'],
})
export class AvailabilityModule {}
