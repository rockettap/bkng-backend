import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SellerService } from './application/seller.service';
import { SELLER_REPOSITORY } from './application/tokens';
import { SellerController } from './infrastructure/seller.controller';
import { PrismaSellerRepository } from './infrastructure/seller.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    SellerService,
    {
      provide: SELLER_REPOSITORY,
      useClass: PrismaSellerRepository,
    },
  ],
  controllers: [SellerController],
  exports: [SellerService],
})
export class SellerModule {}
