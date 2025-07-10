import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from './users-repository.interface';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: UsersRepository,
  ) {}

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findBySub(sub: string): Promise<User | null> {
    return await this.usersRepository.findBySub(sub);
  }

  async create(user: User): Promise<User> {
    return await this.usersRepository.create(user);
  }
}
