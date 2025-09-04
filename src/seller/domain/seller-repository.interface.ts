import { Repository } from 'src/common/repository.interface';
import { Seller } from './seller.entity';

export interface SellerRepository extends Repository<Seller> {
  findByEmail(email: string): Promise<Seller | null>;
  findByGoogleId(googleId: string): Promise<Seller | null>;
  update(seller: Seller): Promise<Seller>;
  delete(seller: Seller): Promise<boolean>;
}
