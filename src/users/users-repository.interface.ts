import { Repository } from 'src/common/repository.interface';
import { User } from './user.entity';

export interface UsersRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(sub: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(user: User): Promise<boolean>;
}
