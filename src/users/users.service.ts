import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { User } from './user.entity';
import { UsersRepository } from './users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: UsersRepository,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(sub: string): Promise<User | null> {
    return await this.usersRepository.findByGoogleId(sub);
  }

  async create(user: User): Promise<User> {
    return await this.usersRepository.create(user);
  }

  async update(user: User): Promise<User> {
    return await this.usersRepository.update(user);
  }

  async delete(user: User): Promise<boolean> {
    return await this.usersRepository.delete(user);
  }
}
