import { Inject, Injectable } from '@nestjs/common';
import { SellerNotFoundError } from '../domain/errors/seller-not-found.error';
import { SellerRepository } from '../domain/seller-repository.interface';
import { Seller } from '../domain/seller.entity';
import { SELLER_REPOSITORY } from './tokens';

@Injectable()
export class SellerService {
  constructor(
    @Inject(SELLER_REPOSITORY)
    private readonly sellerRepository: SellerRepository,
  ) {}

  async findByIdOrThrow(id: number): Promise<Seller> {
    const seller = await this.sellerRepository.findById(id);
    if (!seller) {
      throw new SellerNotFoundError(id);
    }
    return seller;
  }

  async findByEmail(email: string): Promise<Seller | null> {
    return await this.sellerRepository.findByEmail(email);
  }

  async findByEmailOrThrow(email: string): Promise<Seller> {
    const seller = await this.sellerRepository.findByEmail(email);
    if (!seller) {
      throw new SellerNotFoundError();
    }
    return seller;
  }

  async findByGoogleId(googleId: string): Promise<Seller | null> {
    return await this.sellerRepository.findByGoogleId(googleId);
  }

  async create(seller: Seller): Promise<Seller> {
    return await this.sellerRepository.create(seller);
  }

  async update(seller: Seller): Promise<Seller> {
    return await this.sellerRepository.update(seller);
  }

  async delete(seller: Seller): Promise<boolean> {
    return await this.sellerRepository.delete(seller);
  }
}
